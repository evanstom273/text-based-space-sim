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

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · lucide-react
