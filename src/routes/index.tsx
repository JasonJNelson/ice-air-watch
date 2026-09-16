import { createFileRoute } from "@tanstack/react-router";
import { TrackerApp } from "@/components/tracker/tracker-app";
import { getFlights } from "@/lib/flights/queries";

export const Route = createFileRoute("/")({
  loader: () => getFlights(),
  component: Home,
});

function Home() {
  const initial = Route.useLoaderData();
  return <TrackerApp initial={initial} />;
}
