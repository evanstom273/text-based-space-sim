# text-based-space-sim

A starship command terminal for a text-based space simulation set in *The Orville* / Planetary Union universe.

## Current scope

This repository currently contains the **desktop/terminal shell only** — no gameplay systems yet.

### Shell features

- Draggable, resizable floating windows
- Minimise / maximise / restore / close
- Left, right, and top edge snapping with preview overlay
- Multiple applications open simultaneously (single instance per app)
- Desktop icon launcher and searchable Applications menu
- Taskbar/dock for switching between open modules
- Responsive mobile layout (Union datapad-style fullscreen modules)
- Planetary Union starship terminal visual identity

### Placeholder modules

COMMS, MISSIONS, CREW ROSTER, SHIP STATUS, NAVIGATION, SCIENCE, LOGS, SETTINGS

## Development

```bash
npm install
npm run dev
npm run build
```

## GitHub Pages

The site deploys automatically when changes land on `main` via [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

After the first successful deploy, enable **GitHub Pages** in the repository settings with source **GitHub Actions**. The live URL will be:

https://evanstom273.github.io/text-based-space-sim/

To verify a Pages build locally:

```bash
GITHUB_PAGES=true npm run build
npm run preview
```

## Desktop Windows Installer (.exe)

You can build a native Windows installer (`.exe`) locally or via GitHub Actions:

```bash
# Build production bundle and generate Windows NSIS installer
npm run dist:win
```

The compiled installer will be saved to `release/Union-Terminal-Setup-*.exe`.
The build workflow is defined in [`.github/workflows/build-desktop.yml`](.github/workflows/build-desktop.yml).

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · lucide-react
