import type { FleetAircraft, OperatorId } from "./types";

/** Documented ICE Air charter airframes from public ADS-B reporting. */
export const FLEET: FleetAircraft[] = [
  { hex: "a2a728", tail: "N270GX", icaoType: "A320", typeName: "Airbus A320", operator: "GlobalX" },
  { hex: "a2bd72", tail: "N276GX", icaoType: "A320", typeName: "Airbus A320", operator: "GlobalX" },
  { hex: "a2c129", tail: "N277GX", icaoType: "A321", typeName: "Airbus A321", operator: "GlobalX" },
  { hex: "a2c4e0", tail: "N278GX", icaoType: "A320", typeName: "Airbus A320", operator: "GlobalX" },
  { hex: "a2d25e", tail: "N281GX", icaoType: "A320", typeName: "Airbus A320", operator: "GlobalX" },
  { hex: "a2d615", tail: "N282GX", icaoType: "A320", typeName: "Airbus A320", operator: "GlobalX" },
  { hex: "a2e13a", tail: "N285GX", icaoType: "A320", typeName: "Airbus A320", operator: "GlobalX" },
  { hex: "a2f016", tail: "N289GX", icaoType: "A320", typeName: "Airbus A320", operator: "GlobalX" },
  { hex: "a2f9dd", tail: "N291GX", icaoType: "A320", typeName: "Airbus A320", operator: "GlobalX" },
  { hex: "a83f98", tail: "N630VA", icaoType: "A320", typeName: "Airbus A320", operator: "Avelo" },
  { hex: "a86e85", tail: "N642VA", icaoType: "A320", typeName: "Airbus A320", operator: "Avelo" },
  { hex: "ab7437", tail: "N837VA", icaoType: "A320", typeName: "Airbus A320", operator: "Avelo" },
  { hex: "a365c9", tail: "N318NV", icaoType: "A319", typeName: "Airbus A319", operator: "GlobalX" },
  { hex: "a36980", tail: "N319NV", icaoType: "A319", typeName: "Airbus A319", operator: "GlobalX" },
  { hex: "a35404", tail: "N313XA", icaoType: "B734", typeName: "Boeing 737-400", operator: "Eastern Air Express" },
  { hex: "a357bb", tail: "N314XA", icaoType: "B734", typeName: "Boeing 737-400", operator: "Eastern Air Express" },
  { hex: "a0c62d", tail: "N149XA", icaoType: "B734", typeName: "Boeing 737-400", operator: "Eastern Air Express" },
  { hex: "a2e29c", tail: "N285XA", icaoType: "B734", typeName: "Boeing 737-400", operator: "Eastern Air Express" },
  { hex: "a82727", tail: "N624XA", icaoType: "B738", typeName: "Boeing 737-800", operator: "Eastern Air Express" },
  { hex: "ab0147", tail: "N808TJ", icaoType: "B734", typeName: "Boeing 737-400", operator: "Eastern Air Express" },
  { hex: "aafd90", tail: "N807TJ", icaoType: "B734", typeName: "Boeing 737-400", operator: "Eastern Air Express" },
  { hex: "ab0ec5", tail: "N811TJ", icaoType: "B734", typeName: "Boeing 737-400", operator: "Eastern Air Express" },
  { hex: "a82307", tail: "N623SW", icaoType: "B733", typeName: "Boeing 737-300", operator: "Eastern Air Express" },
  { hex: "a82a75", tail: "N625SW", icaoType: "B733", typeName: "Boeing 737-300", operator: "Eastern Air Express" },
  { hex: "a82e2c", tail: "N626SW", icaoType: "B733", typeName: "Boeing 737-300", operator: "Eastern Air Express" },
  { hex: "a831e3", tail: "N627SW", icaoType: "B733", typeName: "Boeing 737-300", operator: "Eastern Air Express" },
  { hex: "a83951", tail: "N629SW", icaoType: "B733", typeName: "Boeing 737-300", operator: "Eastern Air Express" },
  { hex: "a6b0f5", tail: "N530FL", icaoType: "A321", typeName: "Airbus A321", operator: "World Atlantic" },
  { hex: "a75013", tail: "N570TA", icaoType: "A321", typeName: "Airbus A321", operator: "World Atlantic" },
  { hex: "a96907", tail: "N705VL", icaoType: "A321", typeName: "Airbus A321", operator: "World Atlantic" },
  { hex: "a96cbe", tail: "N706VL", icaoType: "A321", typeName: "Airbus A321", operator: "World Atlantic" },
  { hex: "ab2ae1", tail: "N819AX", icaoType: "B772", typeName: "Boeing 777-200", operator: "Omni Air" },
  { hex: "a1ac1a", tail: "N207AX", icaoType: "B763", typeName: "Boeing 767-300", operator: "Omni Air" },
  { hex: "a3e89a", tail: "N351AX", icaoType: "B763", typeName: "Boeing 767-300", operator: "Omni Air" },
  { hex: "a45199", tail: "N378AX", icaoType: "B763", typeName: "Boeing 767-300", operator: "Omni Air" },
  { hex: "a21772", tail: "N234AX", icaoType: "B763", typeName: "Boeing 767-300", operator: "Omni Air" },
  { hex: "a1f3aa", tail: "N225AX", icaoType: "B763", typeName: "Boeing 767-300", operator: "Omni Air" },
  { hex: "a8b479", tail: "N660CP", icaoType: "B737", typeName: "Boeing 737", operator: "Other" },
];

export const FLEET_BY_HEX = new Map(FLEET.map((a) => [a.hex, a]));

export const FLEET_HEXES = FLEET.map((a) => a.hex);

/** Callsigns used on ICE Air charters (not scheduled passenger service). */
export const ICE_CALLSIGN_PREFIXES = ["GXA", "BBQ", "OAE", "WAL", "WAA", "SWQ"];

export function operatorFromCallsign(callsign: string): OperatorId {
  const cs = callsign.trim().toUpperCase();
  if (cs.startsWith("GXA")) return "GlobalX";
  if (cs.startsWith("BBQ") || cs.startsWith("SWQ")) return "Eastern Air Express";
  if (cs.startsWith("OAE")) return "Omni Air";
  if (cs.startsWith("WAL") || cs.startsWith("WAA")) return "World Atlantic";
  if (cs.startsWith("VXP")) return "Avelo";
  return "Other";
}

export function isIceCallsign(callsign: string): boolean {
  const cs = callsign.trim().toUpperCase();
  return ICE_CALLSIGN_PREFIXES.some((p) => cs.startsWith(p));
}

export function isWatchlistReg(reg: string): boolean {
  const r = reg.trim().toUpperCase();
  return /^N\d{3}GX$/.test(r);
}
