import { createFileRoute } from "@tanstack/react-router";
import { getFleetPublic } from "@/lib/flights/adsb.server";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "cache-control": "public, max-age=3600",
};

export const Route = createFileRoute("/api/fleet")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async () => Response.json(getFleetPublic(), { headers: cors }),
    },
  },
});
