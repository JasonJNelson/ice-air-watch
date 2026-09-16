import { PRIMARY_HUBS, SCAN_HUBS, hasMapCoords } from "./airports";
import { getFiledLegs, lookupFiled, type FiledLeg } from "./aviationstack.server";
import {
  FLEET,
  FLEET_BY_HEX,
  FLEET_HEXES,
  isIceCallsign,
  isWatchlistReg,
  operatorFromCallsign,
} from "./fleet";
import { classifyStatus, haversineNm, inferDestination, inferOrigin } from "./geo";
import type {
  DestinationCount,
  FleetRow,
  Flight,
  FlightsPayload,
  HubActivity,
  OperatorId,
  SignalState,
  TrailPoint,
} from "./types";

const CACHE_MS = 8_000;
const TRAIL_MAX = 160;
const STALE_SEC = 45;
const LOST_AFTER_MS = 12 * 60_000;
const GHOST_MS = 6 * 60 * 60_000;
const HUB_SCAN_EVERY_MS = 40_000;
const NOTICE =
  "Live ICE Air contractor charters used on DHS removal missions. Positions from public ADS-B; filed city-pairs from Aviationstack when a callsign matches. Not an official DHS, ICE, or NSA feed.";

const HOSTS = [
  { name: "api.adsb.lol", base: "https://api.adsb.lol", hubPath: "v2" },
  { name: "opendata.adsb.fi", base: "https://opendata.adsb.fi/api", hubPath: "v3" },
] as const;

type RawAc = {
  hex?: string;
  r?: string;
  flight?: string;
  t?: string;
  desc?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number | string;
  alt_geom?: number;
  gs?: number;
  track?: number;
  true_heading?: number;
  baro_rate?: number;
  seen?: number;
  seen_pos?: number;
  squawk?: string;
  dbFlags?: number;
};

type Cache = {
  fetchedAt: number;
  source: string;
  payload: FlightsPayload;
};

const trails = new Map<string, TrailPoint[]>();
const lastLive = new Map<string, Flight>();
const destTally = new Map<string, { iso: string; country: string; hexes: Set<string> }>();
let cache: Cache | null = null;
let inflight: Promise<FlightsPayload> | null = null;
let hubIndex = 0;
let lastHubScan = Date.now();
let hubBackoffUntil = 0;
let hexCursor = 0;
let pollBackoffUntil = 0;
let lastGoodSource = "api.adsb.lol";

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v !== "ground") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function typeNameFor(code: string): string {
  const map: Record<string, string> = {
    A319: "Airbus A319",
    A320: "Airbus A320",
    A321: "Airbus A321",
    A20N: "Airbus A320neo",
    A21N: "Airbus A321neo",
    B733: "Boeing 737-300",
    B734: "Boeing 737-400",
    B737: "Boeing 737",
    B738: "Boeing 737-800",
    B763: "Boeing 767-300",
    B772: "Boeing 777-200",
    B77L: "Boeing 777-200LR",
  };
  return map[code] ?? code;
}

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        accept: "application/json",
        "user-agent":
          "Mozilla/5.0 (compatible; ICEAirWatch/1.0; +https://github.com/adsblol/api)",
      },
    });
    if (res.status === 429) {
      const err = new Error("429");
      (err as Error & { status: number }).status = 429;
      throw err;
    }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

function keepRaw(raw: RawAc): boolean {
  const hex = (raw.hex ?? "").toLowerCase();
  if (FLEET_BY_HEX.has(hex)) return true;
  const callsign = (raw.flight ?? "").trim();
  if (isIceCallsign(callsign)) return true;
  const reg = (raw.r ?? "").trim();
  if (isWatchlistReg(reg)) return true;
  return false;
}

async function fetchWatchlist(): Promise<{ ac: RawAc[]; source: string }> {
  const slice = FLEET_HEXES.slice(hexCursor, hexCursor + 6);
  hexCursor = (hexCursor + 6) % Math.max(FLEET_HEXES.length, 1);
  const extra = [...lastLive.keys()].filter((h) => !slice.includes(h));
  const hexes = [...new Set([...slice, ...extra])].slice(0, 8);
  if (hexes.length === 0) return { ac: [], source: "unavailable" };

  const hosts =
    Date.now() < pollBackoffUntil ? HOSTS.filter((h) => h.name !== "api.adsb.lol") : HOSTS;

  for (const host of hosts) {
    try {
      const json = (await fetchJson(
        `${host.base}/v2/hex/${hexes.join(",")}`,
        12_000,
      )) as { ac?: RawAc[] };
      return { ac: Array.isArray(json.ac) ? json.ac : [], source: host.name };
    } catch (err) {
      if (err instanceof Error && err.message === "429" && host.name === "api.adsb.lol") {
        pollBackoffUntil = Date.now() + 90_000;
        hubBackoffUntil = pollBackoffUntil;
      }
    }
  }
  return { ac: [], source: "unavailable" };
}

async function scanNextHub(): Promise<RawAc[]> {
  const now = Date.now();
  if (now < hubBackoffUntil) return [];
  if (now - lastHubScan < HUB_SCAN_EVERY_MS) return [];
  lastHubScan = now;
  const hub = SCAN_HUBS[hubIndex % SCAN_HUBS.length];
  hubIndex += 1;

  const hosts = Date.now() < pollBackoffUntil ? HOSTS.filter((h) => h.name !== "api.adsb.lol") : HOSTS;
  for (const host of hosts) {
    try {
      const url = `${host.base}/${host.hubPath}/lat/${hub.lat}/lon/${hub.lon}/dist/${hub.dist}`;
      const json = (await fetchJson(url, 10_000)) as { ac?: RawAc[] };
      return (json.ac ?? []).filter(keepRaw);
    } catch (err) {
      if (err instanceof Error && err.message === "429" && host.name === "api.adsb.lol") {
        hubBackoffUntil = Date.now() + 120_000;
      }
    }
  }
  return [];
}

function haversineQuick(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  return Math.sqrt(dLat * dLat + dLon * dLon) * 60;
}

function signalOf(ageSec: number): SignalState {
  if (ageSec <= STALE_SEC) return "live";
  if (ageSec * 1000 <= LOST_AFTER_MS) return "stale";
  return "lost";
}

function toFlight(raw: RawAc, now: number, fresh: boolean): Flight | null {
  const hex = (raw.hex ?? "").toLowerCase();
  if (!hex) return null;
  if (!keepRaw(raw)) return null;

  const lat = asNumber(raw.lat);
  const lon = asNumber(raw.lon);
  if (lat == null || lon == null) return null;

  const fleet = FLEET_BY_HEX.get(hex);
  const callsign = (raw.flight ?? "").trim() || fleet?.tail || (raw.r ?? "").trim() || hex.toUpperCase();
  const tail = fleet?.tail || (raw.r ?? "").trim() || hex.toUpperCase();
  const operator: OperatorId = fleet?.operator ?? operatorFromCallsign(callsign);
  const icaoType = raw.t || fleet?.icaoType || "JET";
  const typeName = fleet?.typeName || typeNameFor(icaoType);

  const altRaw = raw.alt_baro;
  const speedKt = asNumber(raw.gs);
  const altNum = asNumber(altRaw);
  const onGround =
    altRaw === "ground" || (speedKt != null && speedKt < 40 && (altNum ?? 0) < 200);
  const altitudeFt = onGround ? 0 : altNum ?? asNumber(raw.alt_geom);
  const heading = asNumber(raw.true_heading) ?? asNumber(raw.track);
  const dest = inferDestination(lat, lon, heading, speedKt, onGround, altitudeFt);
  const origin = inferOrigin(lat, lon, heading);
  let status = classifyStatus({
    onGround,
    dest: dest.airport,
    lat,
    lon,
    heading,
  });
  if (isIceCallsign(callsign) && status === "unknown") status = "transfer";

  const seenAgeSec = fresh
    ? (asNumber(raw.seen_pos) ?? asNumber(raw.seen) ?? 0)
    : Math.max(asNumber(raw.seen_pos) ?? 0, 0);
  const point: TrailPoint = { lat, lon, alt: altitudeFt, ts: now };
  const prev = trails.get(hex) ?? [];
  const last = prev[prev.length - 1];
  if (!last || haversineQuick(last.lat, last.lon, lat, lon) > 0.12) {
    trails.set(hex, [...prev, point].slice(-TRAIL_MAX));
  }

  const destCountry =
    dest.airport && dest.airport.iso !== "US" && dest.airport.iso !== "PR"
      ? dest.airport.country
      : null;

  return {
    hex,
    tail,
    callsign,
    icaoType,
    typeName,
    operator,
    agency: "DHS ICE Air",
    lat,
    lon,
    altitudeFt,
    heading,
    speedKt,
    verticalRate: asNumber(raw.baro_rate),
    onGround,
    status,
    signal: signalOf(seenAgeSec),
    origin,
    destination: dest.airport,
    destConfidence: dest.confidence,
    destCountry,
    seenAt: new Date(now).toISOString(),
    seenAgeSec,
    trail: trails.get(hex) ?? [point],
    squawk: raw.squawk ?? null,
    discovered: !fleet,
    ladd: Boolean((raw.dbFlags ?? 0) & 8),
  };
}

function applyFiled(flight: Flight, leg: FiledLeg | undefined): Flight {
  if (!leg) return flight;
  const origin = leg.origin ?? flight.origin;
  const destination = leg.destination ?? flight.destination;
  let status = classifyStatus({
    onGround: flight.onGround,
    dest: destination,
    lat: flight.lat,
    lon: flight.lon,
    heading: flight.heading,
  });
  if (isIceCallsign(flight.callsign) && status === "unknown") status = "transfer";
  const destCountry =
    destination && destination.iso !== "US" && destination.iso !== "PR"
      ? destination.country
      : null;
  return {
    ...flight,
    origin,
    destination,
    destConfidence: leg.destination ? "confirmed" : flight.destConfidence,
    destCountry,
    status,
  };
}

function rememberDestinations(flights: Flight[]) {
  for (const flight of flights) {
    if (flight.status !== "removal" || !flight.destCountry || !flight.destination) continue;
    const key = flight.destination.iso;
    const row = destTally.get(key) ?? { iso: key, country: flight.destCountry, hexes: new Set() };
    row.hexes.add(flight.hex);
    destTally.set(key, row);
  }
}

function countsOf(flights: Flight[]) {
  const active = flights.filter((f) => f.signal !== "lost");
  return {
    live: active.length,
    airborne: active.filter((f) => !f.onGround).length,
    removal: active.filter((f) => f.status === "removal").length,
    transfer: active.filter((f) => f.status === "transfer").length,
    ground: active.filter((f) => f.status === "ground").length,
    lost: flights.filter((f) => f.signal === "lost").length,
    watchlist: FLEET.length,
  };
}

function hubActivity(flights: Flight[]): HubActivity[] {
  const liveFlights = flights.filter((f) => f.signal !== "lost");
  const hubs = new Map(
    PRIMARY_HUBS.map((hub) => [
      hub.iata,
      {
        iata: hub.iata,
        icao: hub.icao,
        city: hub.city,
        lat: hub.lat,
        lon: hub.lon,
      },
    ]),
  );
  for (const flight of liveFlights) {
    for (const ap of [flight.origin, flight.destination]) {
      if (!ap?.iceHub || !hasMapCoords(ap) || hubs.has(ap.iata)) continue;
      hubs.set(ap.iata, {
        iata: ap.iata,
        icao: ap.icao,
        city: ap.city,
        lat: ap.lat,
        lon: ap.lon,
      });
    }
  }
  return [...hubs.values()].map((hub) => ({
    ...hub,
    live: liveFlights.filter((f) => {
      if (f.origin?.iata === hub.iata || f.destination?.iata === hub.iata) return true;
      return haversineNm(f.lat, f.lon, hub.lat, hub.lon) < 70;
    }).length,
  }));
}

function destinationBoard(): DestinationCount[] {
  return [...destTally.values()]
    .map((row) => ({ country: row.country, iso: row.iso, count: row.hexes.size }))
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));
}

function fleetBoard(flights: Flight[]): FleetRow[] {
  const byHex = new Map(flights.map((f) => [f.hex, f]));
  const rows: FleetRow[] = FLEET.map((ac) => {
    const live = byHex.get(ac.hex);
    return {
      hex: ac.hex,
      tail: ac.tail,
      operator: ac.operator,
      icaoType: ac.icaoType,
      typeName: ac.typeName,
      live: Boolean(live && live.signal !== "lost"),
      status: live?.status ?? null,
      signal: live?.signal ?? null,
      destCountry: live?.destCountry ?? null,
      callsign: live?.callsign ?? null,
    };
  });
  for (const flight of flights) {
    if (!flight.discovered) continue;
    if (rows.some((r) => r.hex === flight.hex)) continue;
    rows.push({
      hex: flight.hex,
      tail: flight.tail,
      operator: flight.operator,
      icaoType: flight.icaoType,
      typeName: flight.typeName,
      live: flight.signal !== "lost",
      status: flight.status,
      signal: flight.signal,
      destCountry: flight.destCountry,
      callsign: flight.callsign,
    });
  }
  return rows.sort((a, b) => Number(b.live) - Number(a.live) || a.tail.localeCompare(b.tail));
}

function buildPayload(flights: Flight[], source: string, fetchedAt: number): FlightsPayload {
  const sorted = [...flights].sort((a, b) => {
    const sig = (s: Flight) => (s.signal === "live" ? 0 : s.signal === "stale" ? 1 : 2);
    const rank = (s: Flight) => (s.status === "removal" ? 0 : s.onGround ? 2 : 1);
    return sig(a) - sig(b) || rank(a) - rank(b) || a.tail.localeCompare(b.tail);
  });
  return {
    generatedAt: new Date(fetchedAt).toISOString(),
    source,
    staleMs: 0,
    notice: NOTICE,
    counts: countsOf(sorted),
    flights: sorted,
    hubs: hubActivity(sorted),
    destinations: destinationBoard(),
    fleet: fleetBoard(sorted),
  };
}

export async function fetchLiveFlights(): Promise<FlightsPayload> {
  const now = Date.now();
  const ttl = cache && cache.payload.counts.live === 0 ? 12_000 : CACHE_MS;
  if (cache && now - cache.fetchedAt < ttl) {
    return { ...cache.payload, staleMs: now - cache.fetchedAt };
  }
  if (inflight) return inflight;

  inflight = (async () => {
    const fetchedAt = Date.now();
    try {
      const [{ ac, source }, filed] = await Promise.all([fetchWatchlist(), getFiledLegs()]);
      const hubAc = Date.now() < hubBackoffUntil ? [] : await scanNextHub();
      const merged = new Map<string, RawAc>();
      for (const raw of [...ac, ...hubAc]) {
        const hex = (raw.hex ?? "").toLowerCase();
        if (hex) merged.set(hex, raw);
      }
      const flights: Flight[] = [];
      const seen = new Set<string>();
      let filedHits = 0;
      for (const raw of merged.values()) {
        const built = toFlight(raw, fetchedAt, true);
        if (!built) continue;
        const flight = applyFiled(built, lookupFiled(built.callsign, filed));
        if (flight.destConfidence === "confirmed") filedHits += 1;
        seen.add(flight.hex);
        lastLive.set(flight.hex, flight);
        flights.push(flight);
      }
      for (const [hex, prev] of lastLive) {
        if (seen.has(hex)) continue;
        const age = fetchedAt - Date.parse(prev.seenAt);
        if (age < GHOST_MS) {
          const seenAgeSec = Math.round(age / 1000);
          const ghost = applyFiled(
            {
              ...prev,
              seenAgeSec,
              signal: signalOf(seenAgeSec),
              trail: trails.get(hex) ?? prev.trail,
            },
            lookupFiled(prev.callsign, filed),
          );
          flights.push(ghost);
        }
      }
      rememberDestinations(flights);
      const base = source === "unavailable" && flights.length ? lastGoodSource : source;
      if (source !== "unavailable") lastGoodSource = source;
      const label = filedHits > 0 && base !== "unavailable" ? `${base}+aviationstack` : base;
      const payload = buildPayload(flights, label, fetchedAt);
      cache = { fetchedAt, source, payload };
      return payload;
    } catch (err) {
      if (cache) {
        return {
          ...cache.payload,
          staleMs: Date.now() - cache.fetchedAt,
          source: `${cache.source} (cached)`,
        };
      }
      return buildPayload([], err instanceof Error ? err.message : "error", fetchedAt);
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export async function fetchFlightByHex(hex: string): Promise<Flight | null> {
  const data = await fetchLiveFlights();
  return data.flights.find((f) => f.hex === hex.toLowerCase()) ?? null;
}

export function getFleetPublic() {
  return {
    notice: NOTICE,
    aircraft: FLEET,
    count: FLEET.length,
  };
}
