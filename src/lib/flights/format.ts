import type { Flight, FlightStatus, SignalState } from "./types";

/** Escape ADS-B / airport strings before interpolating into Leaflet divIcon HTML. */
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "\u0026amp;")
    .replaceAll("<", "\u0026lt;")
    .replaceAll(">", "\u0026gt;")
    .replaceAll('"', "\u0026quot;")
    .replaceAll("'", "\u0026#39;");
}

export function formatAlt(ft: number | null): string {
  if (ft == null) return "—";
  if (ft <= 0) return "GND";
  return `${Math.round(ft).toLocaleString("en-US")} ft`;
}

export function formatSpd(kt: number | null): string {
  if (kt == null) return "—";
  return `${Math.round(kt)} kt`;
}

export function formatHdg(deg: number | null): string {
  if (deg == null) return "—";
  return `${Math.round(deg).toString().padStart(3, "0")}°`;
}

export function formatVs(fpm: number | null): string {
  if (fpm == null) return "—";
  const n = Math.round(fpm);
  if (n > 80) return `+${n.toLocaleString("en-US")} fpm`;
  if (n < -80) return `${n.toLocaleString("en-US")} fpm`;
  return "Level";
}

export function formatAge(sec: number): string {
  if (sec < 60) return `${Math.max(0, Math.round(sec))}s`;
  if (sec < 3600) return `${Math.round(sec / 60)}m`;
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatRoute(flight: Flight): string {
  const o = flight.origin?.iata ?? "—";
  const d = flight.destination?.iata ?? "—";
  return `${o} → ${d}`;
}

export function statusLabel(status: FlightStatus): string {
  switch (status) {
    case "removal":
      return "Intl removal";
    case "transfer":
      return "Domestic";
    case "ground":
      return "On ground";
    default:
      return "Unknown";
  }
}

export function statusColor(status: FlightStatus, signal: SignalState = "live"): string {
  if (signal === "lost") return "#4a4e52";
  switch (status) {
    case "removal":
      return "#c45c4a";
    case "transfer":
      return "#7a8ea3";
    case "ground":
      return "#6b7178";
    default:
      return "#9a958c";
  }
}

export function confidenceLabel(c: Flight["destConfidence"]): string {
  if (c === "confirmed") return "Filed route";
  if (c === "estimated") return "Estimated";
  return "Unknown";
}

export function signalLabel(signal: SignalState): string {
  if (signal === "live") return "Live";
  if (signal === "stale") return "Stale";
  return "Last known";
}
