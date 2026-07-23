# Navalis Web

> Frontend for a real-time online Battleship game built with React 19 and Vite, featuring WebSocket gameplay, animated UI with a 1930s Rubber Hose noir aesthetic, and full mobile responsiveness.

![Status](https://img.shields.io/badge/Status-completed-green)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-8-purple)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-4-cyan)

## Table of Contents

- [Technologies](#technologies)
- [Design System](#design-system)
- [Folder Structure](#folder-structure)
- [Features](#features)
- [Game Flow](#game-flow)
- [How to Run](#how-to-run)

## Technologies

| Technology | Role in the Project |
|---|---|
| React 19 | UI library |
| Vite 8 | Build tool and dev server |
| Tailwind CSS 4 | Utility-first styling |
| Bun | Package manager and runtime |
| @stomp/stompjs 7.3 | WebSocket STOMP client for real-time gameplay |
| tw-animate-css | Animation utilities |

## Design System

**Ink & Iron Noir** — Rubber Hose 1930s + Film Noir + Brutalism

| Element | Style |
|---|---|
| Palette | Monochromatic strict (#131313, #000, #FFF, #C2C2C2, #6E6E6E) |
| Fonts | Bricolage Grotesque (headlines), Work Sans (body), JetBrains Mono (labels) |
| Borders | 4-6px solid black, hard shadow (6px 6px 0px 0px black) |
| Buttons | Pill rounded-full, rubber animations (boil/squash & stretch) |
| Cards | Corner circles, dashed inner border, hard shadow |
| Film effects | SVG grain, dust particles, scratches, vignette, projector glow |
| Cursor | Custom Mickey glove (PNG base64) |

## Folder Structure

```
src/
├── main.jsx                → Entry point (AuthProvider + GameProvider + AudioProvider)
├── NavalisApp.jsx          → Orchestrator (title screen, splash, iris transitions, view routing)
├── hooks/
│   └── useAudio.js         → Audio hook (music tracks, SFX, volume, mute)
├── services/
│   ├── api.js              → HTTP client (fetch + JWT interceptor)
│   └── stomp.js            → STOMP WebSocket client
├── contexts/
│   ├── AuthContext.jsx     → Login/register/logout + localStorage persistence
│   ├── GameContext.jsx     → Game state + WebSocket event handlers
│   └── AudioContext.jsx    → Audio provider (wraps useAudio)
├── components/
│   ├── auth/               → AuthView (login/register)
│   ├── lobby/              → LobbyView (list/create/join games, ranking)
│   ├── waiting/            → WaitingRoomView (waiting for opponent)
│   ├── placing/            → PlacingShipsView (position fleet via STOMP)
│   ├── arena/              → ArenaView (fire via STOMP, turns, mascots)
│   ├── board/              → BoardGrid, FragmentRow
│   ├── game-over/          → GameOverModal, CancelledModal
│   └── shared/             → NeonInput, BrandMark, FilmOverlay, IrisTransition, SoundControl
└── img/                    → Logo, mascots, ship assets
```

## Features

- **Real-time multiplayer** via WebSocket/STOMP
- **Room codes** for easy game sharing
- **Auto-positioning** ships with spacing buffer
- **Turn timer** (20s) with visual countdown
- **30s reconnection** system with countdown overlay
- **Forfeit/W.O.** system with confirmation modal
- **Animated mascots** with shoot/damage reactions
- **Ship sinking** flood-fill visualization
- **Game over** with ship reveal, scoreboard, and duration
- **Ranking** leaderboard (top 20 by wins)
- **Audio system** with per-view music and SFX
- **Iris wipe transitions** (Cuphead-style)
- **Title screen + splash** with loading animation
- **Film grain** overlay (inline SVG filter)
- **Full mobile responsiveness** (stacked boards, touch-friendly controls)
- **Auto-logout** on expired token

## Game Flow

```
Title Screen → Splash → Login/Register → Lobby → Create/Join Game
    → Waiting Room → Place Ships → Battle Arena → Game Over → Lobby
```

| View | Description |
|---|---|
| Auth | Login or register with animated ship mascot |
| Lobby | Create/join games, enter room code, view ranking |
| Waiting | Share room code, wait for opponent |
| Placing | Drag/click ships onto grid, auto-position, confirm fleet |
| Arena | Fire at enemy grid, real-time turns, mascot animations |
| Game Over | Scoreboard with sunk ship count, duration, return to lobby |

## How to Run

### Prerequisites

- [Bun](https://bun.sh/) installed
- Backend API running at `http://localhost:5000` (see [navalis-api](https://github.com/navalis-studio/navalis-api))

### 1) Clone and access the project

```bash
git clone https://github.com/navalis-studio/navalis-web.git
cd navalis-web
```

### 2) Install dependencies

```bash
bun install
```

### 3) Set up environment variables (optional)

For local development, defaults point to `localhost:5000`. For production:

```bash
cp .env.example .env.local
```

```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000/ws
```

### 4) Start the development server

```bash
bun run dev
```

The app will be available at `http://localhost:5173`.

### Running with Docker

```bash
docker compose up -d --build
```

This builds and serves the app via Nginx on port 80.
