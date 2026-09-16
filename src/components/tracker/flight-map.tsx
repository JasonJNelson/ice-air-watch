import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type {
  CircleMarker,
  GeoJSON as LeafletGeoJSON,
  Map as LeafletMap,
  Marker,
  Polyline,
  Renderer,
} from "leaflet";
import { greatCircle } from "@/lib/flights/geo";
import { hasMapCoords } from "@/lib/flights/airports";
import { statusColor, escapeHtml } from "@/lib/flights/format";
import type { Flight, HubActivity } from "@/lib/flights/types";

const PLANE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5Z"/></svg>`;

export type FlightMapApi = {
  zoomIn: () => void;
  zoomOut: () => void;
};

type Props = {
  flights: Flight[];
  hubs?: HubActivity[];
  destIsos?: string[];
  focusIso?: string | null;
  selectedHex: string | null;
  follow: boolean;
  showHubs: boolean;
  showLabels: boolean;
  showRoutes: boolean;
  fitNonce: number;
  panelOpen: boolean;
  onSelect: (hex: string | null) => void;
  onHub: (iata: string) => void;
  onCountry: (iso: string, name: string) => void;
};

type CountryProps = { iso?: string; name?: string };
type LeafletNS = typeof import("leaflet");
type ZoomUi = "world" | "named" | "detail";

function overlayPad(map: LeafletMap) {
  const { x: w, y: h } = map.getSize();
  const mobile = w < 768;
  const header = document.querySelector("header");
  const chrome = document.querySelector("[data-map-chrome]");
  const panel = document.querySelector("[data-map-panel]");
  const hud = document.querySelector("[data-map-hud]");
  const hr = header?.getBoundingClientRect();
  const cr = chrome?.getBoundingClientRect();
  const pr = panel?.getBoundingClientRect();
  const hudr = hud?.getBoundingClientRect();
  const padTop = hr ? Math.round(hr.bottom + 12) : 152;
  const bottomDocked = mobile ? [cr, pr, hudr] : [cr, hudr];
  const bottoms = bottomDocked
    .filter((r): r is DOMRect => !!r && r.height > 0)
    .map((r) => r.top);
  const overlayTop = bottoms.length ? Math.min(...bottoms) : null;
  let padBottom = overlayTop != null ? Math.round(h - overlayTop + 10) : mobile ? 280 : 128;
  const padRight = !mobile && pr ? Math.max(24, Math.round(w - pr.left + 12)) : 16;
  const padTopClamped = Math.max(88, padTop);
  const maxPadBottom = Math.max(72, h - padTopClamped - 160);
  padBottom = Math.min(Math.max(72, padBottom), maxPadBottom);
  return {
    paddingTopLeft: [16, padTopClamped] as [number, number],
    paddingBottomRight: [padRight, padBottom] as [number, number],
  };
}

function panIntoClear(map: LeafletMap, lat: number, lon: number, animate: boolean) {
  const size = map.getSize();
  if (size.x < 40 || size.y < 40) return;
  const pad = overlayPad(map);
  const targetX =
    pad.paddingTopLeft[0] + (size.x - pad.paddingTopLeft[0] - pad.paddingBottomRight[0]) / 2;
  const targetY =
    pad.paddingTopLeft[1] + (size.y - pad.paddingTopLeft[1] - pad.paddingBottomRight[1]) / 2;
  const air = map.latLngToContainerPoint([lat, lon]);
  map.panBy([air.x - targetX, air.y - targetY], { animate });
}

function countryStyle(iso: string, dest: Set<string>, focusIso: string | null) {
  const isFocus = focusIso === iso;
  const isDest = dest.has(iso);
  if (isFocus) {
    return {
      color: "#c45c4a",
      weight: 1.6,
      fillColor: "#c45c4a",
      fillOpacity: 0.22,
    };
  }
  if (isDest) {
    return {
      color: "#c45c4a",
      weight: 1.1,
      fillColor: "#c45c4a",
      fillOpacity: 0.12,
    };
  }
  return {
    color: "#3a3d44",
    weight: 0.7,
    fillColor: "#12141a",
    fillOpacity: 0.04,
  };
}

function classifyZoom(z: number): ZoomUi {
  if (z < 5) return "world";
  if (z < 6) return "named";
  return "detail";
}

function planeVisualKey(
  flight: Flight,
  world: boolean,
  labelAll: boolean,
  selectedHex: string | null,
) {
  const isSel = flight.hex === selectedHex;
  const heading = Math.round((flight.heading ?? 0) / 3) * 3;
  const pulse = flight.signal === "live" && !flight.onGround ? 1 : 0;
  const label = isSel || labelAll ? flight.tail : "";
  return `${world ? 1 : 0}|${isSel ? 1 : 0}|${heading}|${flight.status}|${flight.signal}|${pulse}|${label}`;
}

function routesFor(flights: Flight[], selectedHex: string | null, showRoutes: boolean) {
  const selected = flights.find((f) => f.hex === selectedHex) ?? null;
  const list = selected
    ? [selected]
    : showRoutes
      ? flights.filter((f) => f.status === "removal" && f.signal !== "lost")
      : [];
  const key = list
    .map(
      (f) =>
        `${f.hex}:${f.origin?.iata ?? ""}:${f.destination?.iata ?? ""}:${f.destConfidence}:${f.status}:${f.signal}`,
    )
    .join("|");
  return { list, key, selected };
}

const TILE_OPTS = {
  subdomains: "abcd" as const,
  maxZoom: 19,
  updateWhenZooming: false,
  keepBuffer: 2,
};

export const FlightMap = forwardRef<FlightMapApi, Props>(function FlightMap(
  {
    flights,
    hubs = [],
    destIsos = [],
    focusIso = null,
    selectedHex,
    follow,
    showHubs,
    showLabels,
    showRoutes,
    fitNonce,
    panelOpen,
    onSelect,
    onHub,
    onCountry,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const LRef = useRef<LeafletNS | null>(null);
  const countryRendererRef = useRef<Renderer | null>(null);
  const trailRendererRef = useRef<Renderer | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const markerKeyRef = useRef<Map<string, string>>(new Map());
  const trailsRef = useRef<Map<string, Polyline>>(new Map());
  const routesRef = useRef<Polyline[]>([]);
  const airportsRef = useRef<CircleMarker[]>([]);
  const routeKeyRef = useRef("");
  const hubsRef = useRef<Map<string, { marker: Marker; key: string }>>(new Map());
  const countriesRef = useRef<LeafletGeoJSON | null>(null);
  const countriesDataRef = useRef<object | null>(null);
  const destKey = destIsos.join(",");
  const fittedRef = useRef(false);
  const prevSelectedRef = useRef<string | null>(null);
  const lastFitRef = useRef(0);
  const lastSizeRef = useRef("");
  const onSelectRef = useRef(onSelect);
  const onHubRef = useRef(onHub);
  const onCountryRef = useRef(onCountry);
  const [mapReady, setMapReady] = useState(false);
  const [zoomUi, setZoomUi] = useState<ZoomUi>("world");
  const [sizeKey, setSizeKey] = useState("0x0");
  onSelectRef.current = onSelect;
  onHubRef.current = onHub;
  onCountryRef.current = onCountry;

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => mapRef.current?.zoomIn(),
      zoomOut: () => mapRef.current?.zoomOut(),
    }),
    [],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [20, -50],
        zoom: 3,
        minZoom: 2,
        maxZoom: 12,
        zoomControl: false,
        attributionControl: true,
        worldCopyJump: true,
        preferCanvas: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        ...TILE_OPTS,
      }).addTo(map);

      map.createPane("countries");
      map.getPane("countries")!.style.zIndex = "350";
      map.createPane("hubs");
      map.getPane("hubs")!.style.zIndex = "390";
      map.createPane("trails");
      map.getPane("trails")!.style.zIndex = "410";
      map.createPane("mapLabels");
      map.getPane("mapLabels")!.style.zIndex = "430";
      map.getPane("mapLabels")!.style.pointerEvents = "none";
      map.createPane("planes");
      map.getPane("planes")!.style.zIndex = "640";

      countryRendererRef.current = L.canvas({ pane: "countries", padding: 0.35 });
      trailRendererRef.current = L.canvas({ pane: "trails", padding: 0.5 });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png", {
        pane: "mapLabels",
        opacity: 0.62,
        ...TILE_OPTS,
      }).addTo(map);

      map.on("click", () => onSelectRef.current(null));
      map.on("zoomend", () => {
        const next = classifyZoom(map.getZoom());
        setZoomUi((prev) => (prev === next ? prev : next));
      });
      LRef.current = L;
      mapRef.current = map;
      requestAnimationFrame(() => map.invalidateSize());
      setMapReady(true);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      LRef.current = null;
      countryRendererRef.current = null;
      trailRendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const map = mapRef.current;
      map?.invalidateSize();
      if (!map) return;
      const s = map.getSize();
      setSizeKey(`${Math.round(s.x / 32)}x${Math.round(s.y / 32)}`);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    const renderer = countryRendererRef.current;
    if (!map || !mapReady || !L) return;
    let disposed = false;
    const dest = new Set(destKey ? destKey.split(",") : []);

    (async () => {
      if (!countriesDataRef.current) {
        try {
          const res = await fetch("/geo/countries-110m.geojson");
          if (!res.ok) return;
          countriesDataRef.current = await res.json();
        } catch {
          return;
        }
      }
      if (disposed || mapRef.current !== map || !countriesDataRef.current) return;

      const applyStyle = (feat: { properties?: CountryProps } | undefined) => {
        const iso = feat?.properties?.iso ?? "";
        return { ...countryStyle(iso, dest, focusIso), renderer: renderer ?? undefined };
      };

      if (countriesRef.current) {
        countriesRef.current.setStyle(applyStyle);
        return;
      }

      const layer = L.geoJSON(countriesDataRef.current as never, {
        pane: "countries",
        style: applyStyle,
        onEachFeature: (feat, lyr) => {
          const props = feat.properties as CountryProps;
          const iso = props.iso ?? "";
          const name = props.name ?? iso;
          lyr.on("click", (ev) => {
            L.DomEvent.stopPropagation(ev);
            onCountryRef.current(iso, name);
          });
          if (iso && name) {
            lyr.bindTooltip(name, {
              sticky: true,
              direction: "top",
              opacity: 0.95,
              className: "country-tooltip",
            });
          }
        },
      }).addTo(map);
      countriesRef.current = layer;
    })();

    return () => {
      disposed = true;
    };
  }, [mapReady, destKey, focusIso]);

  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !mapReady || !L) return;

    const liveHex = new Set(flights.map((f) => f.hex));
    const trailRenderer = trailRendererRef.current ?? undefined;
    const named = zoomUi !== "world";
    const world = zoomUi !== "detail";
    const labelAll = showLabels && named;

    for (const [hex, marker] of markersRef.current) {
      if (!liveHex.has(hex)) {
        marker.remove();
        markersRef.current.delete(hex);
        markerKeyRef.current.delete(hex);
      }
    }
    for (const [hex, line] of trailsRef.current) {
      if (!liveHex.has(hex)) {
        line.remove();
        trailsRef.current.delete(hex);
      }
    }

    if (showHubs) {
      const want = new Set(hubs.map((h) => h.iata));
      for (const [iata, rec] of hubsRef.current) {
        if (!want.has(iata)) {
          rec.marker.remove();
          hubsRef.current.delete(iata);
        }
      }
      for (const hub of hubs) {
        const active = hub.live > 0;
        const key = `${named ? 1 : 0}|${active ? 1 : 0}`;
        let rec = hubsRef.current.get(hub.iata);
        if (!rec) {
          const marker = L.marker([hub.lat, hub.lon], {
            pane: "hubs",
            keyboard: true,
            title: `${hub.iata} · ${hub.city}`,
            zIndexOffset: active ? 80 : 0,
            icon: L.divIcon({ className: "hub-marker", html: "", iconSize: [8, 8] }),
          }).addTo(map);
          const iata = hub.iata;
          marker.on("click", (ev) => {
            L.DomEvent.stopPropagation(ev);
            onHubRef.current(iata);
          });
          rec = { marker, key: "" };
          hubsRef.current.set(hub.iata, rec);
        }
        rec.marker.setLatLng([hub.lat, hub.lon]);
        rec.marker.setZIndexOffset(active ? 80 : 0);
        if (rec.key !== key) {
          rec.marker.setIcon(
            L.divIcon({
              className: "hub-marker",
              html: named
                ? `<div class="hub-mark ${active ? "is-live" : ""}"><span>${escapeHtml(hub.iata)}</span></div>`
                : `<div class="hub-dot ${active ? "is-live" : ""}" title="${escapeHtml(hub.iata)}"></div>`,
              iconSize: named ? [40, 18] : [8, 8],
              iconAnchor: named ? [20, 9] : [4, 4],
            }),
          );
          rec.key = key;
        }
      }
    } else if (hubsRef.current.size) {
      for (const rec of hubsRef.current.values()) rec.marker.remove();
      hubsRef.current.clear();
    }

    for (const flight of flights) {
      const color = statusColor(flight.status, flight.signal);
      const heading = flight.heading ?? 0;
      const isSel = flight.hex === selectedHex;
      const showLabel = isSel || labelAll;
      const pulse = flight.signal === "live" && !flight.onGround;
      const visual = planeVisualKey(flight, world, labelAll, selectedHex);

      let marker = markersRef.current.get(flight.hex);
      if (!marker) {
        marker = L.marker([flight.lat, flight.lon], {
          pane: "planes",
          keyboard: true,
          title: flight.tail,
          opacity: flight.signal === "lost" ? 0.55 : 1,
          icon: L.divIcon({ className: "plane-marker", html: "", iconSize: [72, 44] }),
        }).addTo(map);
        const hex = flight.hex;
        marker.on("click", (ev) => {
          L.DomEvent.stopPropagation(ev);
          onSelectRef.current(hex);
        });
        markersRef.current.set(flight.hex, marker);
      } else {
        marker.setLatLng([flight.lat, flight.lon]);
        marker.setOpacity(flight.signal === "lost" ? 0.55 : 1);
        marker.setZIndexOffset(
          isSel ? 1000 : flight.status === "removal" && flight.signal !== "lost" ? 200 : 0,
        );
      }

      if (markerKeyRef.current.get(flight.hex) !== visual) {
        const html = `<div class="plane-stack ${world ? "is-world" : ""}"><div class="plane-glyph ${isSel ? "is-selected" : ""} ${escapeHtml(flight.signal)}" style="color:${escapeHtml(color)};transform:rotate(${heading}deg)">${pulse ? `<span class="pulse-ring"></span>` : ""}${PLANE_SVG}</div>${showLabel ? `<div class="plane-label">${escapeHtml(flight.tail)}</div>` : ""}</div>`;
        marker.setIcon(
          L.divIcon({
            className: "plane-marker",
            html,
            iconSize: world ? [84, 52] : [72, 44],
            iconAnchor: world ? [42, 18] : [36, 14],
          }),
        );
        markerKeyRef.current.set(flight.hex, visual);
      }

      const trailPts = flight.trail.map((p) => [p.lat, p.lon] as [number, number]);
      if (trailPts.length > 1) {
        let line = trailsRef.current.get(flight.hex);
        const style = {
          color,
          weight: isSel ? 2.5 : 1.5,
          opacity: isSel ? 0.9 : flight.signal === "lost" ? 0.2 : 0.45,
        };
        if (!line) {
          line = L.polyline(trailPts, {
            ...style,
            pane: "trails",
            renderer: trailRenderer,
            interactive: false,
          }).addTo(map);
          trailsRef.current.set(flight.hex, line);
        } else {
          line.setLatLngs(trailPts);
          line.setStyle(style);
        }
      }
    }

    const nextRoutes = routesFor(flights, selectedHex, showRoutes);
    if (nextRoutes.key !== routeKeyRef.current) {
      for (const line of routesRef.current) line.remove();
      routesRef.current = [];
      for (const dot of airportsRef.current) dot.remove();
      airportsRef.current = [];
      routeKeyRef.current = nextRoutes.key;

      for (const flight of nextRoutes.list) {
        if (hasMapCoords(flight.origin) && hasMapCoords(flight.destination) && flight.origin && flight.destination) {
          const pts = greatCircle(flight.origin, flight.destination);
          const line = L.polyline(pts, {
            color: statusColor(flight.status, flight.signal),
            weight: nextRoutes.selected ? 1.25 : 1,
            opacity: nextRoutes.selected ? 0.5 : 0.32,
            dashArray: flight.destConfidence === "confirmed" ? undefined : "6 8",
            pane: "trails",
            renderer: trailRenderer,
            interactive: false,
          }).addTo(map);
          routesRef.current.push(line);
        }
        if (!nextRoutes.selected) continue;
        for (const ap of [flight.origin, flight.destination]) {
          if (!hasMapCoords(ap) || !ap) continue;
          const dot = L.circleMarker([ap.lat, ap.lon], {
            radius: 4,
            color: "#ece8e1",
            weight: 1,
            fillColor: "#12141a",
            fillOpacity: 0.9,
            pane: "trails",
            renderer: trailRenderer,
          })
            .bindTooltip(`${ap.iata} · ${ap.city}`, {
              permanent: true,
              direction: "top",
              offset: [0, -6],
              className: "route-tooltip",
            })
            .addTo(map);
          airportsRef.current.push(dot);
        }
      }
    }
  }, [flights, hubs, selectedHex, showHubs, showLabels, showRoutes, mapReady, zoomUi]);

  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !mapReady || !L) return;

    const pad = overlayPad(map);
    const active = flights.filter((f) => f.signal !== "lost");
    const airborne = active.filter((f) => !f.onGround);
    const fitTargets = airborne.length ? airborne : active;
    const sizeChanged = sizeKey !== lastSizeRef.current && lastSizeRef.current !== "";
    lastSizeRef.current = sizeKey;
    const selected = flights.find((f) => f.hex === selectedHex) ?? null;

    const fitVisible = (targets: Flight[], animate: boolean) => {
      const bounds = L.latLngBounds(targets.map((f) => [f.lat, f.lon] as [number, number]));
      if (!bounds.isValid()) return;
      map.fitBounds(bounds.pad(targets.length === 1 ? 0 : 0.2), {
        ...pad,
        maxZoom: 5,
        animate,
      });
    };

    if (fitNonce !== lastFitRef.current) {
      lastFitRef.current = fitNonce;
      if (fitTargets.length) fitVisible(fitTargets, true);
      else map.setView([20, -50], 3, { animate: true });
      fittedRef.current = true;
    } else if (follow && selected) {
      panIntoClear(map, selected.lat, selected.lon, true);
    } else if (selected && (prevSelectedRef.current !== selected.hex || sizeChanged)) {
      if (map.getZoom() < 5) map.setZoom(5, { animate: false });
      panIntoClear(map, selected.lat, selected.lon, !sizeChanged);
    } else if (!fittedRef.current && fitTargets.length > 0) {
      fitVisible(fitTargets, false);
      fittedRef.current = true;
    } else if (sizeChanged && fitTargets.length > 0) {
      fitVisible(fitTargets, false);
    }
    prevSelectedRef.current = selected?.hex ?? null;
  }, [flights, selectedHex, follow, fitNonce, mapReady, panelOpen, sizeKey]);

  return (
    <div className="map-stage">
      <div ref={containerRef} className="absolute inset-0 h-full w-full bg-bg" />
    </div>
  );
});
