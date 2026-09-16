import { createFileRoute } from "@tanstack/react-router";
import { fetchFlightByHex } from "@/lib/flights/adsb.server";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "cache-control": "public, max-age=5",
};

export const Route = createFileRoute("/api/flights/$hex")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ params }) => {
        const hex = params.hex?.trim() ?? "";
        if (!/^[0-9a-f]{6,8}$/i.test(hex)) {
          return Response.json({ error: "invalid_hex" }, { status: 400, headers: cors });
        }
        const flight = await fetchFlightByHex(hex);
        if (!flight) {
          return Response.json({ error: "not_found" }, { status: 404, headers: cors });
        }
        return Response.json(flight, { headers: cors });
      },
    },
  },
});
