# Aksana Company Dashboard - Context & Instructions

This document provides essential context and instructions for AI agents interacting with the Aksana Company Dashboard codebase.

## 1. Project Overview
**Aksana** (formerly Angkasa) is a high-fidelity enterprise dashboard designed for executive business intelligence and operational management.

### Main Technologies
- **Framework**: React 19 (Vite-based)
- **State Management**: TanStack Query (React Query) v5
- **Persistence**: Unified `localStorage` layer (`Aksana_Ecosystem_Data`)
- **Styling**: Tailwind CSS v4 (PostCSS)
- **Data Visualization**: Recharts (Dashboard) and Chart.js (Simulator)
- **Reporting**: Vector-based PDF generation via `@react-pdf/renderer`
- **Icons**: Lucide React

### Key Features
- **Executive Dashboard**: Real-time KPI monitoring, AI-assisted performance syncing, and stock integrity monitoring.
- **Meeting Tool**: A comprehensive workspace for Weekly Reviews, featuring attendance ledgers, KPI trackers, Rocks review, and a structured IDT (Identify, Discuss, Tuntas) session.
- **Growth Simulator**: A high-fidelity 5-Ways financial modeling tool with interactive variable impact analysis.

## 2. Architecture & Data Flow
The application operates as a "local-first" ecosystem with a centralized API layer.

### Unified API Layer (`src/api/dashboardApi.js`)
- All tools read from and write to a single source of truth in `localStorage`.
- **Structural Sync**: Changes in one tool can impact others (e.g., updating simulator variables automatically recalculates Dashboard Profit).
- **Custom Event Sync**: Dispatches `ecosystem_sync` on storage updates to keep components reactive across the app.

### Component Design Pattern
- **Local State + Manual Save**: Heavy input components (Meeting Tool, Simulator) use local state for fluid typing, with a dedicated "Save/Sync" button to persist changes to the global ecosystem. This prevents performance lag and race conditions.

## 3. Building and Running
The project follows standard Vite/NPM workflows:

- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Preview Build**: `npm run preview`
- **Linting**: `npm run lint`

## 4. Development Conventions & Styling

### Global UI Scaling
- A **Global UI Scaling (75%)** is implemented in `src/index.css` for desktop screens (>= 1024px) via root font-size manipulation. This ensures high data density on professional monitors while maintaining accessibility on mobile.

### Branding & Theme
- **Corporate Identity**: Aksana Custom Branding.
- **Colors**: Dark Turquoise (`#095546`) for primary text/borders, Aksana Orange (`#ffa724`) for accents.
- **Typography**: 
    - Web App: `Plus Jakarta Sans`
    - PDF Reports: `Nunito Sans` (Vector text)

### Layout System
- **Responsive Navigation**: Features a persistent desktop sidebar and a responsive top header/drawer for mobile.
- **Container Strategy**: Main content is wrapped in a centered `max-w-[1440px]` container with professional horizontal padding (`px-8 lg:px-16`).

### PDF Reporting
- Templates are defined in `src/components/MeetingPDFReport.jsx`.
- Always use **Direct TTF URLs** from Fontsource for font registration to avoid rendering crashes.

## 5. Deployment Note
The application is designed to be fully functional as a static build, relying on browser storage for all persistence.
