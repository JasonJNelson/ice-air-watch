export type FlightStatus = "removal" | "transfer" | "ground" | "unknown";
export type DestConfidence = "confirmed" | "estimated" | "unknown";
export type SignalState = "live" | "stale" | "lost";
export type AgencyId = "DHS ICE Air";

export type OperatorId =
  | "GlobalX"
  | "Avelo"
  | "Eastern Air Express"
  | "World Atlantic"
  | "Omni Air"
  | "Other";

export type FleetAircraft = {
  hex: string;
  tail: string;
  icaoType: string;
  typeName: string;
  operator: OperatorId;
};

export type Airport = {
  icao: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  iso: string;
  lat: number;
  lon: number;
  iceHub?: boolean;
};

export type TrailPoint = {
  lat: number;
  lon: number;
  alt: number | null;
  ts: number;
};

export type Flight = {
  hex: string;
  tail: string;
  callsign: string;
  icaoType: string;
  typeName: string;
  operator: OperatorId;
  agency: AgencyId;
  lat: number;
  lon: number;
  altitudeFt: number | null;
  heading: number | null;
  speedKt: number | null;
  verticalRate: number | null;
  onGround: boolean;
  status: FlightStatus;
  signal: SignalState;
  origin: Airport | null;
  destination: Airport | null;
  destConfidence: DestConfidence;
  destCountry: string | null;
  seenAt: string;
  seenAgeSec: number;
  trail: TrailPoint[];
  squawk: string | null;
  discovered: boolean;
  ladd: boolean;
};

export type HubActivity = {
  iata: string;
  icao: string;
  city: string;
  lat: number;
  lon: number;
  live: number;
};

export type DestinationCount = {
  country: string;
  iso: string;
  count: number;
};

export type FleetRow = {
  hex: string;
  tail: string;
  operator: OperatorId;
  icaoType: string;
  typeName: string;
  live: boolean;
  status: FlightStatus | null;
  signal: SignalState | null;
  destCountry: string | null;
  callsign: string | null;
};

export type FlightsPayload = {
  generatedAt: string;
  source: string;
  staleMs: number;
  notice: string;
  counts: {
    live: number;
    airborne: number;
    removal: number;
    transfer: number;
    ground: number;
    lost: number;
    watchlist: number;
  };
  flights: Flight[];
  hubs: HubActivity[];
  destinations: DestinationCount[];
  fleet: FleetRow[];
};
