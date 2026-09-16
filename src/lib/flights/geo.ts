import { AIRPORTS, FOREIGN_AIRPORTS, ICE_HUBS, isRemovalCountry } from "./airports";
import type { Airport, DestConfidence, FlightStatus } from "./types";

const EARTH_NM = 3440.065;

export function haversineNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dLat = p2 - p1;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_NM * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function projectNm(
  lat: number,
  lon: number,
  headingDeg: number,
  distanceNm: number,
): { lat: number; lon: number } {
  const δ = distanceNm / EARTH_NM;
  const θ = (headingDeg * Math.PI) / 180;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lon * Math.PI) / 180;
  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ),
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2),
    );
  return { lat: (φ2 * 180) / Math.PI, lon: (((λ2 * 180) / Math.PI + 540) % 360) - 180 };
}

export function nearestAirport(
  lat: number,
  lon: number,
  pool: Airport[] = AIRPORTS,
): { airport: Airport; nm: number } | null {
  let best: { airport: Airport; nm: number } | null = null;
  for (const airport of pool) {
    const nm = haversineNm(lat, lon, airport.lat, airport.lon);
    if (!best || nm < best.nm) best = { airport, nm };
  }
  return best;
}

export function greatCircle(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
  steps = 32,
): [number, number][] {
  const pts: [number, number][] = [];
  const dist = haversineNm(a.lat, a.lon, b.lat, b.lon);
  if (dist < 1) return [[a.lat, a.lon], [b.lat, b.lon]];
  const heading = initialHeading(a.lat, a.lon, b.lat, b.lon);
  for (let i = 0; i <= steps; i++) {
    const p = projectNm(a.lat, a.lon, heading, (dist * i) / steps);
    pts.push([p.lat, p.lon]);
  }
  pts[pts.length - 1] = [b.lat, b.lon];
  return pts;
}

export function initialHeading(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function headingDelta(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export function inferOrigin(lat: number, lon: number, heading: number | null): Airport | null {
  if (heading == null) {
    return nearestAirport(lat, lon, ICE_HUBS)?.airport ?? null;
  }
  const behind = projectNm(lat, lon, (heading + 180) % 360, 80);
  const hit = nearestAirport(behind.lat, behind.lon, ICE_HUBS);
  if (hit && hit.nm < 400) return hit.airport;
  return nearestAirport(lat, lon, ICE_HUBS)?.airport ?? null;
}

export function inferDestination(
  lat: number,
  lon: number,
  heading: number | null,
  speedKt: number | null,
  onGround: boolean,
  altitudeFt: number | null,
): { airport: Airport | null; confidence: DestConfidence } {
  if (onGround || (speedKt != null && speedKt < 40)) {
    const here = nearestAirport(lat, lon);
    if (here && here.nm < 8) return { airport: here.airport, confidence: "confirmed" };
    return { airport: here?.airport ?? null, confidence: "unknown" };
  }

  const gs = speedKt && speedKt > 80 ? speedKt : 420;
  const horizons = [25, 45, 75, 110].map((min) =>
    heading != null ? projectNm(lat, lon, heading, (gs * min) / 60) : { lat, lon },
  );

  let best: { airport: Airport; score: number; confidence: DestConfidence } | null = null;

  const overConus = lat > 24.4 && lat < 49.2 && lon < -66 && lon > -125;
  const headingSouth = heading != null && heading > 90 && heading < 270;
  const candidates =
    heading == null
      ? AIRPORTS
      : overConus && !headingSouth
        ? ICE_HUBS
        : [...FOREIGN_AIRPORTS, ...ICE_HUBS];

  for (const airport of candidates) {
    const nmNow = haversineNm(lat, lon, airport.lat, airport.lon);
    let along = 0;
    if (heading != null) {
      const brg = initialHeading(lat, lon, airport.lat, airport.lon);
      const delta = headingDelta(heading, brg);
      if (delta > 55 && nmNow > 40) continue;
      along = 1 - delta / 90;
    }
    let projNm = nmNow;
    for (const p of horizons) {
      projNm = Math.min(projNm, haversineNm(p.lat, p.lon, airport.lat, airport.lon));
    }
    const foreignBoost = isRemovalCountry(airport.iso) ? 1.2 : 1;
    const score = (along * 180 + Math.max(0, 500 - projNm)) * foreignBoost;
    const descending = (altitudeFt ?? 35000) < 18000 && nmNow < 120;
    const confidence: DestConfidence =
      nmNow < 40 && descending ? "confirmed" : projNm < 90 ? "estimated" : "unknown";
    if (!best || score > best.score) best = { airport, score, confidence };
  }

  if (!best) return { airport: null, confidence: "unknown" };
  return { airport: best.airport, confidence: best.confidence };
}

export function classifyStatus(opts: {
  onGround: boolean;
  dest: Airport | null;
  lat: number;
  lon: number;
  heading: number | null;
}): FlightStatus {
  if (opts.onGround) return "ground";
  if (opts.dest && isRemovalCountry(opts.dest.iso)) return "removal";
  if (opts.dest && (opts.dest.iso === "US" || opts.dest.iso === "PR" || opts.dest.iso === "CA")) {
    return "transfer";
  }

  const { lat, lon, heading } = opts;
  const overGulf = lat < 28.2 && lat > 14 && lon < -80 && lon > -98;
  const overCaribbean = lat < 24 && lat > 8 && lon < -59 && lon > -88;
  const overMexico = lat < 32.6 && lat > 14 && lon < -97 && lon > -118;
  const headingSouth = heading != null && heading > 90 && heading < 270;

  if ((overGulf || overCaribbean) && headingSouth) return "removal";
  if (overMexico && headingSouth && lat < 27) return "removal";
  if (lat < 24 && lon > -130 && lon < -30) return "removal";
  if (lon > -30 || lon < -140) return "removal";

  return "transfer";
}
