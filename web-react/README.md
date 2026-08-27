# TrafficIQ — React Website

React 18 + Vite + React Router + Tailwind CSS marketing site for TrafficIQ.

## Run

```bash
cd web-react
npm install
npm run dev
```

## Pages (React Router)

- `/` — Home (hero, stats, features preview, how-it-works, CTA)
- `/features` — full feature grid
- `/demo` — interactive live demo (corridor chips → route cards → grounded copilot)
- `/copilot` — copilot showcase + interactive chat

## Structure

- `src/data.js` — single source of truth: corridors, routes, copilot engine, features, steps
- `src/components/` — Navbar, Footer, RouteCard, Reveal (scroll animation)
- `src/pages/` — Home, Features, Demo, Copilot
- `src/index.css` — Tailwind layers + design-system component classes

## Build

```bash
npm run build
npm run preview
```