# ICE Air Watch

Live world map of ICE Air contractor charters used on DHS removal missions. Positions come from public ADS-B. Filed city-pairs come from Aviationstack when a callsign matches. This is **not** an official DHS, ICE, or NSA feed.

## What it shows

- Live and last-known contractor tails (GlobalX, Avelo, Eastern Air Express, World Atlantic, Omni Air, and discovered ICE callsigns)
- International removals vs domestic transfers vs ground
- Staging hubs and inferred destination countries
- Public JSON at `/api/flights`, `/api/flights/:hex`, and `/api/fleet`

## Run locally

```bash
npm ci
npm run dev
```

Optional, server-only, for filed-route overlay:

```bash
export AVIATIONSTACK_ACCESS_KEY=your_key
```

Never put that key in `VITE_*` variables — they ship to the browser.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (Vercel/Nitro) |
| `npm run typecheck` | TypeScript |
| `npm run test:ci` | Tracker unit tests used in GitHub Actions |
| `npm run security` | Secret, sink, CORS, and npm-audit scan |

## CI / CD

GitHub Actions on every push and pull request to `main`:

1. **ci** — typecheck, unit tests, security scan, production `npm audit` (high+), production build
2. **security** — same secret/sink/CORS scanner, plus a Monday cron
3. **deploy** — Vercel production deploy when `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` repository secrets are set

Dependabot opens weekly npm and monthly Actions PRs.

To go live without Actions secrets, import this repository in [Vercel](https://vercel.com) and let their Git integration deploy `main`. Set `AVIATIONSTACK_ACCESS_KEY` there as a **server** env var if you want filed city-pairs.

## Data

- ADS-B: `api.adsb.lol`, fallback `opendata.adsb.fi`
- Filed legs: Aviationstack (optional)
- Country outlines: Natural Earth 110m GeoJSON in `public/geo/`
