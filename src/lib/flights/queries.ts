import { createServerFn } from "@tanstack/react-start";

export const getFlights = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchLiveFlights } = await import("./adsb.server");
  return fetchLiveFlights();
});
