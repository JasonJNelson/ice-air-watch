import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  Crosshair,
  Globe,
  Layers,
  MapPin,
  Maximize2,
  Minus,
  Plus,
  Radio,
  Route,
  Search,
  Type,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlightMap, type FlightMapApi } from "@/components/tracker/flight-map";
import {
  confidenceLabel,
  formatAge,
  formatAlt,
  formatHdg,
  formatRoute,
  formatSpd,
  formatVs,
  signalLabel,
  statusLabel,
} from "@/lib/flights/format";
import { getFlights } from "@/lib/flights/queries";
import type {
  DestinationCount,
  FleetRow,
  Flight,
  FlightStatus,
  FlightsPayload,
  HubActivity,
  OperatorId,
  SignalState,
} from "@/lib/flights/types";
import { cn } from "@/lib/utils";

type Filter = "all" | FlightStatus | "lost";
type PanelTab = "live" | "fleet" | "dest";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "removal", label: "Removals" },
  { id: "transfer", label: "Domestic" },
  { id: "ground", label: "Ground" },
  { id: "lost", label: "Last known" },
];

const OPERATOR_ORDER: OperatorId[] = [
  "GlobalX",
  "Avelo",
  "Eastern Air Express",
  "World Atlantic",
  "Omni Air",
  "Other",
];

function toneFor(status: FlightStatus) {
  if (status === "removal") return "removal" as const;
  if (status === "transfer") return "transfer" as const;
  if (status === "ground") return "ground" as const;
  return "muted" as const;
}

function toneColor(status: FlightStatus, signal?: SignalState | null) {
  if (signal === "lost") return "var(--color-lost)";
  if (status === "removal") return "var(--color-removal)";
  if (status === "transfer") return "var(--color-transfer)";
  return "var(--color-ground)";
}

function matchesSearch(flight: Flight, q: string): boolean {
  if (!q) return true;
  return (
    flight.tail.toLowerCase().includes(q) ||
    flight.callsign.toLowerCase().includes(q) ||
    flight.operator.toLowerCase().includes(q) ||
    flight.agency.toLowerCase().includes(q) ||
    flight.hex.toLowerCase().includes(q) ||
    (flight.destination?.city ?? "").toLowerCase().includes(q) ||
    (flight.origin?.city ?? "").toLowerCase().includes(q) ||
    (flight.destCountry ?? "").toLowerCase().includes(q) ||
    (flight.origin?.iata ?? "").toLowerCase().includes(q) ||
    (flight.destination?.iata ?? "").toLowerCase().includes(q)
  );
}

export function TrackerApp({ initial }: { initial: FlightsPayload }) {
  const { data, dataUpdatedAt, isFetching } = useQuery({
    queryKey: ["flights"],
    queryFn: () => getFlights(),
    initialData: initial,
    refetchInterval: 10_000,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const [filter, setFilter] = useState<Filter>("all");
  const [tab, setTab] = useState<PanelTab>("live");
  const [query, setQuery] = useState("");
  const [selectedHex, setSelectedHex] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [follow, setFollow] = useState(false);
  const [showHubs, setShowHubs] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showGhosts, setShowGhosts] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [fitNonce, setFitNonce] = useState(0);
  const [clock, setClock] = useState("");
  const mapApi = useRef<FlightMapApi>(null);

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "UTC",
        }) + " UTC",
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedHex(null);
        setFollow(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const flights = data.flights ?? [];
  const hubs = data.hubs ?? [];
  const fleet = data.fleet ?? [];
  const destinations = data.destinations ?? [];
  const selected = flights.find((f) => f.hex === selectedHex) ?? null;

  const q = query.trim().toLowerCase();

  const listed = useMemo(() => {
    return flights.filter((f) => {
      if (filter === "lost") {
        if (f.signal !== "lost") return false;
      } else if (filter !== "all") {
        if (f.signal === "lost") return false;
        if (f.status !== filter) return false;
      } else if (!showGhosts && f.signal === "lost") {
        return false;
      }
      return matchesSearch(f, q);
    });
  }, [flights, filter, q, showGhosts]);

  const destIsos = useMemo(
    () => destinations.filter((row) => row.iso && row.iso !== "US").map((row) => row.iso),
    [destinations],
  );

  const focusIso = useMemo(() => {
    const selectedDest = selected?.destination?.iso;
    if (selectedDest && selectedDest !== "US") return selectedDest;
    if (!q) return null;
    const named = destinations.find(
      (d) => d.country.toLowerCase() === q || d.iso.toLowerCase() === q,
    );
    if (named) return named.iso;
    const flight = flights.find((f) => (f.destCountry ?? "").toLowerCase() === q);
    return flight?.destination?.iso ?? null;
  }, [selected, q, destinations, flights]);

  const ticker = useMemo(
    () => flights.filter((f) => f.signal !== "lost" && !f.onGround),
    [flights],
  );

  function selectHex(hex: string | null) {
    setSelectedHex(hex);
    if (!hex) setFollow(false);
    if (hex) {
      setPanelOpen(true);
      setTab("live");
    }
  }

  function pickHub(iata: string) {
    setTab("live");
    setFilter("all");
    setQuery(iata);
    setPanelOpen(true);
    setSelectedHex(null);
    setFollow(false);
  }

  function pickCountry(country: string) {
    setTab("live");
    setFilter("removal");
    setQuery(country);
    setPanelOpen(true);
  }

  function pickMapCountry(iso: string, name: string) {
    if (!iso || iso === "US") {
      setQuery("");
      setFilter("all");
      setSelectedHex(null);
      setFollow(false);
      return;
    }
    pickCountry(name);
    setSelectedHex(null);
    setFollow(false);
  }

  function pickFleet(row: FleetRow) {
    const live = flights.find((f) => f.hex === row.hex);
    setQuery(row.tail);
    setPanelOpen(true);
    if (live) {
      setTab("live");
      setSelectedHex(live.hex);
      setFilter(live.signal === "lost" ? "lost" : "all");
    }
  }

  const liveHubs = hubs.filter((h) => h.live > 0).length;
  const feedDown = data.source === "unavailable";

  return (
    <div className="relative h-dvh overflow-hidden bg-bg text-fg">
      <FlightMap
        ref={mapApi}
        flights={listed}
        hubs={hubs}
        destIsos={destIsos}
        focusIso={focusIso}
        selectedHex={selectedHex}
        follow={follow}
        showHubs={showHubs}
        showLabels={showLabels}
        showRoutes={showRoutes}
        fitNonce={fitNonce}
        panelOpen={panelOpen}
        onSelect={selectHex}
        onHub={pickHub}
        onCountry={pickMapCountry}
      />
      <div className="map-vignette" />

      <header className="pointer-events-none absolute left-3 top-3 z-20 max-w-[min(100%-1.5rem,28rem)] md:left-4 md:top-4">
        <div className="hud-card pointer-events-auto px-3 py-2.5 md:px-4 md:py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-2xs font-medium uppercase tracking-[0.22em] text-muted">
                DHS ICE Air · world map
              </p>
              <h1 className="font-display text-xl italic leading-none tracking-tight text-fg md:text-3xl">
                ICE Air Watch
              </h1>
            </div>
            <span className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 font-mono text-2xs uppercase tracking-[0.14em] text-muted">
              <span className={cn("size-1.5 rounded-full", isFetching ? "bg-live" : "bg-live/70")} />
              {feedDown ? "Retry" : "Live"}
            </span>
          </div>
          <p className="mt-2 hidden max-w-sm text-xs leading-relaxed text-muted text-pretty md:block">
            Contractor charters flying DHS removal missions. Public ADS-B — not an official DHS or NSA feed.
          </p>
          <div className="mt-2 flex gap-4 font-mono tabular-nums md:mt-3 md:gap-5">
            <MastStat label="Airborne" value={data.counts.airborne} />
            <MastStat label="Removals" value={data.counts.removal} accent />
            <MastStat label="Countries" value={destinations.length} />
            <MastStat label="Hubs" value={liveHubs} />
          </div>
        </div>
        {destinations.length > 0 ? (
          <div className="pointer-events-auto mt-2 flex max-w-full flex-wrap gap-1">
            {destinations.slice(0, 6).map((row) => (
              <button
                key={row.iso}
                type="button"
                onClick={() => pickCountry(row.country)}
                className="rounded-full border border-border bg-surface/90 px-2.5 py-1 font-mono text-2xs uppercase tracking-[0.12em] text-muted shadow-[var(--shadow-panel)] backdrop-blur-sm hover:text-fg"
              >
                {row.country}
                <span className="ml-1.5 tabular-nums text-removal">{row.count}</span>
              </button>
            ))}
          </div>
        ) : null}
      </header>

      <div className="pointer-events-none absolute right-3 top-3 z-20 hidden items-center gap-2 md:flex">
        <span className="hud-card pointer-events-auto px-3 py-2 font-mono text-xs tabular-nums text-muted">
          {clock}
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex max-h-[calc(100dvh-7.5rem)] flex-col gap-2 md:contents">
        <div
          data-map-chrome
          className="pointer-events-none flex shrink-0 flex-col items-start gap-2 md:absolute md:bottom-3 md:left-4 md:right-[24.5rem]"
        >
          {selected ? (
            <div data-map-hud className="pointer-events-auto w-full">
              <FlightHud
                flight={selected}
                follow={follow}
                onFollow={() => setFollow((v) => !v)}
                onClose={() => selectHex(null)}
                updatedAt={dataUpdatedAt}
              />
            </div>
          ) : null}
          <div className="pointer-events-auto hidden hud-card px-2.5 py-2 md:flex md:gap-3">
            <LegendItem color="var(--color-removal)" label="Intl removal" />
            <LegendItem color="var(--color-transfer)" label="Domestic" />
            <LegendItem color="var(--color-lost)" label="Last known" />
          </div>
          <div className="pointer-events-auto flex flex-wrap gap-1">
            <LayerToggle pressed={showHubs} onClick={() => setShowHubs((v) => !v)} icon={MapPin} label="Hubs" />
            <LayerToggle pressed={showLabels} onClick={() => setShowLabels((v) => !v)} icon={Type} label="Labels" />
            <LayerToggle pressed={showGhosts} onClick={() => setShowGhosts((v) => !v)} icon={Radio} label="Ghosts" />
            <LayerToggle pressed={showRoutes} onClick={() => setShowRoutes((v) => !v)} icon={Route} label="Routes" />
            <LayerToggle
              pressed={follow}
              onClick={() => selected && setFollow((v) => !v)}
              icon={Crosshair}
              label={follow ? "Following" : "Follow"}
              disabled={!selected}
            />
            <LayerToggle pressed={false} onClick={() => setFitNonce((n) => n + 1)} icon={Maximize2} label="Fit" />
            <LayerToggle pressed={false} onClick={() => mapApi.current?.zoomIn()} icon={Plus} label="In" ariaLabel="Zoom in" />
            <LayerToggle pressed={false} onClick={() => mapApi.current?.zoomOut()} icon={Minus} label="Out" ariaLabel="Zoom out" />
          </div>
          {ticker.length > 0 ? (
            <div className="ticker-track pointer-events-auto flex w-full gap-1.5 overflow-x-auto hud-card p-1.5">
              {ticker.map((flight) => (
                <button
                  key={flight.hex}
                  type="button"
                  onClick={() => selectHex(flight.hex)}
                  className={cn(
                    "flex h-10 shrink-0 items-center gap-2 rounded-[var(--radius-sm)] px-2.5 font-mono text-xs",
                    selectedHex === flight.hex ? "bg-accent text-accent-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
                  )}
                >
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: selectedHex === flight.hex ? "currentColor" : toneColor(flight.status, flight.signal) }}
                  />
                  <span className="tracking-wide">{flight.tail}</span>
                  <span className="hidden text-2xs uppercase tracking-[0.12em] opacity-70 sm:inline">
                    {flight.destination?.iata ?? (flight.onGround ? "GND" : "AIR")}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

      <aside
        data-map-panel
        className={cn(
          "relative z-30 flex min-h-0 w-full flex-col overflow-hidden pointer-events-auto hud-card transition-[transform,opacity] duration-[var(--motion-fast)] ease-[var(--ease-out)]",
          "md:absolute md:inset-y-auto md:top-20 md:bottom-4 md:left-auto md:right-4 md:max-h-none md:w-[22rem]",
          panelOpen ? "opacity-100" : "max-h-14 md:max-h-none",
          panelOpen && (selected ? "max-h-[30vh] md:max-h-none" : "max-h-[42vh] md:max-h-none"),
        )}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tail, hub, city, country"
              className="h-10 w-full rounded-[var(--radius-sm)] border border-border bg-bg pl-8 pr-9 text-sm text-fg placeholder:text-subtle focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center text-subtle hover:text-fg"
                onClick={() => setQuery("")}
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={panelOpen ? "Collapse list" : "Expand list"}
            onClick={() => setPanelOpen((v) => !v)}
          >
            <ChevronDown
              className={cn("size-5 transition-transform", panelOpen ? "rotate-0" : "-rotate-90")}
            />
          </Button>
        </div>

        <div className="flex shrink-0 gap-1 border-b border-border px-3 py-2">
          <TabChip active={tab === "live"} onClick={() => setTab("live")} icon={Radio} label="Live" count={data.counts.live} />
          <TabChip active={tab === "fleet"} onClick={() => setTab("fleet")} icon={Layers} label="Fleet" count={fleet.length} />
          <TabChip active={tab === "dest"} onClick={() => setTab("dest")} icon={Globe} label="Dest" count={destinations.length} />
        </div>

        {tab === "live" ? (
          <div className="flex shrink-0 gap-1 overflow-x-auto px-3 py-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "h-8 shrink-0 rounded-full px-3 font-mono text-2xs uppercase tracking-[0.14em]",
                  filter === f.id ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-fg",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {tab === "live" ? (
            listed.length === 0 ? (
              <EmptyState fetching={isFetching} />
            ) : (
              <ul className="divide-y divide-border">
                {listed.map((flight) => (
                  <li key={flight.hex}>
                    <button
                      type="button"
                      onClick={() => selectHex(flight.hex)}
                      className={cn(
                        "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors duration-[var(--motion-quick)]",
                        selectedHex === flight.hex ? "bg-surface-2" : "hover:bg-surface-2/60",
                        flight.signal === "lost" && "opacity-70",
                      )}
                    >
                      <span
                        className="mt-1.5 size-2 shrink-0 rounded-full"
                        style={{ background: toneColor(flight.status, flight.signal) }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="font-mono text-sm font-medium tracking-wide">
                            {flight.tail}
                          </span>
                          <Badge tone={flight.signal === "lost" ? "muted" : toneFor(flight.status)}>
                            {flight.signal === "lost" ? signalLabel(flight.signal) : statusLabel(flight.status)}
                          </Badge>
                        </span>
                        <span className="mt-1 block truncate text-sm text-muted">
                          {formatRoute(flight)}
                          {flight.destCountry ? ` · ${flight.destCountry}` : ""}
                        </span>
                        <span className="mt-0.5 block font-mono text-micro text-subtle tabular-nums">
                          {flight.agency} · {flight.callsign} · {formatAlt(flight.altitudeFt)}
                          {flight.ladd ? " · LADD" : ""}
                          {flight.discovered ? " · unlisted" : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : null}

          {tab === "fleet" ? (
            <FleetBoard rows={fleet} query={q} selectedHex={selectedHex} onPick={pickFleet} />
          ) : null}

          {tab === "dest" ? (
            <DestBoard
              destinations={destinations}
              hubs={hubs}
              query={q}
              onCountry={pickCountry}
              onHub={pickHub}
            />
          ) : null}
        </div>

        <footer className="hidden shrink-0 border-t border-border px-3 py-2.5 text-micro leading-relaxed text-subtle md:block">
          {feedDown
            ? "ADS-B feed unreachable — retrying."
            : `Source ${data.source} · ${data.counts.live} live · ${data.counts.lost ?? 0} last-known`}
          {" · "}
          <a href="/api/flights" className="text-muted underline-offset-2 hover:text-fg hover:underline">
            JSON
          </a>
        </footer>
      </aside>
      </div>
    </div>
  );
}

function MastStat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div>
      <p className="text-2xs uppercase tracking-[0.16em] text-subtle">{label}</p>
      <p className={cn("text-base font-medium leading-none md:text-lg", accent ? "text-removal" : "text-fg")}>{value}</p>
    </div>
  );
}

function LayerToggle({
  pressed,
  onClick,
  icon: Icon,
  label,
  disabled,
  ariaLabel,
}: {
  pressed: boolean;
  onClick: () => void;
  icon: typeof MapPin;
  label: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-11 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border font-mono text-2xs uppercase tracking-[0.12em] shadow-[var(--shadow-panel)] backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-40 md:h-8 md:w-auto md:px-2.5",
        pressed
          ? "border-accent/40 bg-accent text-accent-fg"
          : "border-border bg-surface/92 text-muted hover:text-fg",
      )}
    >
      <Icon className="size-3.5 md:size-3" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

function TabChip({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Radio;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] px-2 font-mono text-2xs uppercase tracking-[0.12em]",
        active ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-fg",
      )}
    >
      <Icon className="size-3" />
      {label}
      <span className="tabular-nums opacity-80">{count}</span>
    </button>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-[0.12em] text-muted">
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function EmptyState({ fetching }: { fetching: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <Radio className="size-6 text-subtle" />
      <p className="text-sm text-muted">
        {fetching ? "Contacting ADS-B network…" : "No matching aircraft broadcasting right now."}
      </p>
      <p className="max-w-[16rem] text-xs leading-relaxed text-subtle text-pretty">
        ICE Air charters go quiet overnight and over open ocean. Last-known positions stay on the map for six hours.
      </p>
    </div>
  );
}

function FleetBoard({
  rows,
  query,
  selectedHex,
  onPick,
}: {
  rows: FleetRow[];
  query: string;
  selectedHex: string | null;
  onPick: (row: FleetRow) => void;
}) {
  const filtered = rows.filter((row) => {
    if (!query) return true;
    return (
      row.tail.toLowerCase().includes(query) ||
      row.operator.toLowerCase().includes(query) ||
      row.icaoType.toLowerCase().includes(query) ||
      (row.callsign ?? "").toLowerCase().includes(query) ||
      (row.destCountry ?? "").toLowerCase().includes(query)
    );
  });

  const groups = OPERATOR_ORDER.map((op) => ({
    op,
    rows: filtered.filter((r) => r.operator === op),
  })).filter((g) => g.rows.length > 0);

  if (filtered.length === 0) {
    return <div className="px-6 py-10 text-center text-sm text-muted">No airframes match that search.</div>;
  }

  return (
    <div className="pb-3">
      {groups.map((group) => (
        <section key={group.op} className="border-b border-border last:border-b-0">
          <h3 className="flex items-center justify-between px-3 py-2 font-mono text-2xs uppercase tracking-[0.16em] text-subtle">
            <span>{group.op}</span>
            <span className="tabular-nums">
              {group.rows.filter((r) => r.live).length}/{group.rows.length}
            </span>
          </h3>
          <ul>
            {group.rows.map((row) => (
              <li key={row.hex}>
                <button
                  type="button"
                  onClick={() => onPick(row)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2/60",
                    selectedHex === row.hex && "bg-surface-2",
                  )}
                >
                  <span className={cn("size-2 shrink-0 rounded-full", row.live ? "bg-live" : "bg-lost")} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-sm font-medium">{row.tail}</span>
                      <span className="font-mono text-2xs uppercase tracking-[0.12em] text-subtle">
                        {row.icaoType}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-micro text-subtle">
                      {row.live
                        ? `${row.callsign ?? "live"}${row.destCountry ? ` · ${row.destCountry}` : ""}`
                        : "Not broadcasting"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function DestBoard({
  destinations,
  hubs,
  query,
  onCountry,
  onHub,
}: {
  destinations: DestinationCount[];
  hubs: HubActivity[];
  query: string;
  onCountry: (country: string) => void;
  onHub: (iata: string) => void;
}) {
  const dests = destinations.filter((d) => !query || d.country.toLowerCase().includes(query));
  const hubRows = [...hubs]
    .filter((h) => !query || h.iata.toLowerCase().includes(query) || h.city.toLowerCase().includes(query))
    .sort((a, b) => b.live - a.live || a.iata.localeCompare(b.iata));
  const max = Math.max(...dests.map((d) => d.count), 1);

  return (
    <div className="pb-3">
      <h3 className="px-3 py-2 font-mono text-2xs uppercase tracking-[0.16em] text-subtle">
        Session removals
      </h3>
      {dests.length === 0 ? (
        <p className="px-3 pb-4 text-sm text-muted">
          No international removal destinations inferred this session yet.
        </p>
      ) : (
        <ul className="divide-y divide-border border-b border-border">
          {dests.map((row) => (
            <li key={row.iso}>
              <button
                type="button"
                onClick={() => onCountry(row.country)}
                className="flex w-full flex-col gap-1.5 px-3 py-2.5 text-left hover:bg-surface-2/60"
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-fg">{row.country}</span>
                  <span className="font-mono text-sm tabular-nums text-removal">{row.count}</span>
                </span>
                <span className="block h-1 overflow-hidden rounded-full bg-surface-2">
                  <span
                    className="block h-full rounded-full bg-removal/70"
                    style={{ width: `${Math.max(8, (row.count / max) * 100)}%` }}
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <h3 className="px-3 py-2 font-mono text-2xs uppercase tracking-[0.16em] text-subtle">
        Staging hubs
      </h3>
      <ul className="divide-y divide-border">
        {hubRows.map((hub) => (
          <li key={hub.iata}>
            <button
              type="button"
              onClick={() => onHub(hub.iata)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2/60"
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-[var(--radius-xs)] border font-mono text-2xs",
                  hub.live > 0
                    ? "border-live/40 bg-live/15 text-fg"
                    : "border-border bg-surface-2 text-muted",
                )}
              >
                {hub.iata}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-fg">{hub.city}</span>
                <span className="font-mono text-micro text-subtle tabular-nums">{hub.live} nearby</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FlightHud({
  flight,
  follow,
  onFollow,
  onClose,
  updatedAt,
}: {
  flight: Flight;
  follow: boolean;
  onFollow: () => void;
  onClose: () => void;
  updatedAt: number;
}) {
  const dest = flight.destination
    ? `${flight.destination.city}${flight.destCountry ? `, ${flight.destCountry}` : ""}`
    : "—";
  return (
    <div className="hud-card px-3 py-2.5 md:px-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-2xs uppercase tracking-[0.16em] text-subtle">
            {flight.agency} · {flight.operator}
          </p>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <h2 className="font-display text-xl italic tracking-tight md:text-2xl">{flight.tail}</h2>
            <p className="truncate font-mono text-sm text-muted">
              {formatRoute(flight)} · {dest}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant={follow ? "default" : "outline"} size="sm" aria-pressed={follow} onClick={onFollow}>
            <Crosshair className="size-3.5" />
            {follow ? "Following" : "Follow"}
          </Button>
          <Button variant="ghost" size="iconSm" aria-label="Close details" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-2 md:gap-3">
        <HudReadout label="Alt" value={formatAlt(flight.altitudeFt)} />
        <HudReadout label="Spd" value={formatSpd(flight.speedKt)} />
        <HudReadout label="Hdg" value={formatHdg(flight.heading)} />
        <HudReadout label="VS" value={flight.onGround ? "GND" : formatVs(flight.verticalRate)} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge tone={toneFor(flight.status)}>{statusLabel(flight.status)}</Badge>
        <Badge tone={flight.signal === "live" ? "live" : "muted"}>{signalLabel(flight.signal)}</Badge>
        <Badge tone="muted">{confidenceLabel(flight.destConfidence)}</Badge>
        {flight.ladd ? <Badge tone="muted">LADD</Badge> : null}
        {flight.squawk ? <Badge tone="muted">Squawk {flight.squawk}</Badge> : null}
        {flight.discovered ? <Badge tone="muted">Unlisted tail</Badge> : null}
        <span className="ml-auto font-mono text-2xs text-subtle tabular-nums">
          {flight.callsign} · {formatAge(flight.seenAgeSec)} · {Math.max(0, Math.round((Date.now() - updatedAt) / 1000))}s
        </span>
      </div>
    </div>
  );
}

function HudReadout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-sm)] bg-bg/45 px-2 py-1.5">
      <p className="font-mono text-2xs uppercase tracking-[0.16em] text-subtle">{label}</p>
      <p className="font-mono text-sm tabular-nums text-fg md:text-base">{value}</p>
    </div>
  );
}
