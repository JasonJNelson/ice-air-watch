import { createFileRoute } from "@tanstack/react-router";
import { fetchLiveFlights } from "@/lib/flights/adsb.server";
import type { Flight, FlightsPayload } from "@/lib/flights/types";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "cache-control": "public, max-age=5",
};

function matchesQuery(flight: Flight, q: string): boolean {
  const hay = [
    flight.tail,
    flight.callsign,
    flight.operator,
    flight.agency,
    flight.hex,
    flight.origin?.iata,
    flight.origin?.city,
    flight.destination?.iata,
    flight.destination?.city,
    flight.destCountry,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function applyQuery(data: FlightsPayload, url: URL): FlightsPayload {
  const status = url.searchParams.get("status");
  const signal = url.searchParams.get("signal");
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  if (!status && !signal && !q) return data;
  return {
    ...data,
    flights: data.flights.filter((flight) => {
      if (status && flight.status !== status) return false;
      if (signal && flight.signal !== signal) return false;
      if (q && !matchesQuery(flight, q)) return false;
      return true;
    }),
  };
}

export const Route = createFileRoute("/api/flights")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ request }) => {
        const data = await fetchLiveFlights();
        const filtered = applyQuery(data, new URL(request.url));
        return Response.json(filtered, { headers: cors });
      },
    },
  },
});
