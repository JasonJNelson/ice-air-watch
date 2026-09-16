import { findAirport, airportFromCodes } from "./airports";
import type { Airport } from "./types";

/**
 * Aviationstack access key is server-only. Never fall back to a source literal —
 * a hardcoded key is a secret-scan failure and ships in the git tree.
 */
function accessKey(): string | null {
  const key = process.env.AVIATIONSTACK_ACCESS_KEY?.trim();
  return key || null;
}

export type FiledLeg = {
  callsign: string;
  origin: Airport | null;
  destination: Airport | null;
  status: string;
};

const OPERATORS = ["GXA", "WAL", "OAE"] as const;
const TTL_MS = 12 * 60_000;
const BACKOFF_MS = 30 * 60_000;

type Cache = { at: number; byCallsign: Map<string, FiledLeg> };

let cache: Cache | null = null;
let inflight: Promise<Map<string, FiledLeg>> | null = null;
let backoffUntil = 0;

function normIdent(s: string): string {
  return s.replace(/\s+/g, "").toUpperCase();
}

type RawFlight = {
  flight_status?: string;
  departure?: { iata?: string | null; icao?: string | null; airport?: string | null };
  arrival?: { iata?: string | null; icao?: string | null; airport?: string | null };
  flight?: { icao?: string | null; iata?: string | null; number?: string | null };
};

function toLeg(raw: RawFlight): FiledLeg | null {
  const callsign = normIdent(raw.flight?.icao || raw.flight?.iata || "");
  if (!callsign) return null;
  const dep = raw.departure;
  const arr = raw.arrival;
  const origin =
    findAirport(dep?.iata) ??
    findAirport(dep?.icao) ??
    airportFromCodes({ iata: dep?.iata, icao: dep?.icao, name: dep?.airport });
  const destination =
    findAirport(arr?.iata) ??
    findAirport(arr?.icao) ??
    airportFromCodes({ iata: arr?.iata, icao: arr?.icao, name: arr?.airport });
  if (!origin && !destination) return null;
  return {
    callsign,
    origin,
    destination,
    status: raw.flight_status ?? "unknown",
  };
}

async function fetchOperator(icao: string): Promise<FiledLeg[]> {
  const key = accessKey();
  if (!key) return [];
  const url = new URL("https://api.aviationstack.com/v1/flights");
  url.searchParams.set("access_key", key);
  url.searchParams.set("airline_icao", icao);
  url.searchParams.set("flight_status", "active");
  url.searchParams.set("limit", "25");
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 14_000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { accept: "application/json" },
    });
    if (res.status === 429) {
      backoffUntil = Date.now() + BACKOFF_MS;
      return [];
    }
    if (!res.ok) return [];
    const json = (await res.json()) as { error?: { code?: string }; data?: RawFlight[] };
    if (json.error?.code === "usage_limit_reached" || json.error?.code === "function_access_restricted") {
      backoffUntil = Date.now() + 6 * 60 * 60_000;
      return [];
    }
    return (json.data ?? []).map(toLeg).filter((x): x is FiledLeg => Boolean(x));
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

export async function getFiledLegs(): Promise<Map<string, FiledLeg>> {
  if (!accessKey()) return cache?.byCallsign ?? new Map();
  const now = Date.now();
  if (now < backoffUntil && cache) return cache.byCallsign;
  if (cache && now - cache.at < TTL_MS) return cache.byCallsign;
  if (inflight) return inflight;

  inflight = (async () => {
    const byCallsign = new Map<string, FiledLeg>();
    const batches = await Promise.all(OPERATORS.map((op) => fetchOperator(op)));
    for (const legs of batches) {
      for (const leg of legs) byCallsign.set(leg.callsign, leg);
    }
    if (byCallsign.size > 0 || !cache) {
      cache = { at: Date.now(), byCallsign };
    }
    return cache?.byCallsign ?? byCallsign;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function lookupFiled(
  callsign: string,
  filed: Map<string, FiledLeg>,
): FiledLeg | undefined {
  const id = normIdent(callsign);
  if (!id) return undefined;
  return filed.get(id);
}
