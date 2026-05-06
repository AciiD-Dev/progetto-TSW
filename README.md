# HomeHub (neural-canvas)

HomeHub is a modern smart-home dashboard built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and SQLite.

## Overview
This project provides a complete control center for a smart home, allowing users to:
- Monitor environmental metrics (temperature, humidity, active devices) in real-time.
- Manage rooms and interact with devices (lights, thermostats, blinds, plugs).
- Create automated sequences using a drag-and-drop node editor.
- View real-time charts and sensor histories.
- Configure threshold-based alerts.

## Project Structure
Following best practices, the project is structured as follows:

- **`app/`**: Next.js App Router structure.
  - `(dashboard)/`: The authenticated route group containing the main app views.
  - `api/`: API Routes for devices, rooms, readings, alerts, auth, etc.
  - `editor/`, `login/`, `pricing/`: Standalone pages outside the dashboard shell.
- **`components/`**: Reusable React components organized by domain.
  - `ui/`: Generic UI components (Boundary, Toast, ThemeToggle).
  - `dashboard/`: Dashboard-specific widgets (MetricCard, TemperatureChart).
  - `devices/`: Device interaction cards and modals.
  - `rooms/`: Room display cards and modals.
  - `editor/`: The node-based automation editor components.
  - `layout/`: Global navigation and footers.
- **`lib/`**: Utilities and hooks.
  - `server/`: Server-side ONLY modules (`db.ts`, `auth.ts`, `password.ts`).
  - `hooks/`: Client-side React hooks (`use-api-with-retry`, `use-form-validation`, `use-sse-stream`).
  - `validation.ts`: Zod/Custom validation schemas.
- **`types/`**: Centralized TypeScript definitions (`index.ts`).

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI/Styling**: React 19, Tailwind CSS v4
- **Database**: SQLite (via `better-sqlite3`)
- **Authentication**: JWT (via `jose`), bcryptjs
- **Charts**: Chart.js / react-chartjs-2
- **Drag & Drop**: `@dnd-kit` and `@xyflow/react`

## Getting Started

First, install the dependencies:
```bash
npm install
```

Copy the example environment file:
```bash
cp .env.example .env.local
```

Seed the database (creates demo rooms, devices, and history):
```bash
npm run seed
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The default login is `admin@home.local` with password `password123`.

## Architecture Details

- **Database**: We use `better-sqlite3` as it runs natively. In production, Vercel loads the bundled `homedb.sqlite` into the serverless function's `/tmp` directory.
- **Authentication**: Next.js 16 middleware (`proxy.ts`) protects all routes except public assets. Tokens are stored in HttpOnly cookies.
- **Real-time Data**: Device metrics are streamed via Server-Sent Events (SSE) from the `api/events/stream` route.