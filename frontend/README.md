# Aspira Frontend

Next.js 15 + TypeScript + Tailwind v3 web app for the Aspira public-service feedback platform.

## Stack

- **Next.js 15** App Router (TypeScript strict mode)
- **Tailwind CSS v3** with custom design tokens (CSS custom properties → `tailwind.config.ts`)
- **Framer Motion** for transitions
- **Lucide React** for icons
- **Recharts** for admin analytics
- **React Hook Form + Zod** for forms
- **Zustand** for client state, **Axios** for HTTP, **Sonner** for toasts

## Getting started

```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL to the backend URL
npm run dev
```

The app runs on `http://localhost:3000`.

## Layout

```
src/
  app/             App Router pages, layouts, route groups
    globals.css    Design tokens (CSS custom properties)
  components/
    ui/            Base design-system components (Button, Input, Card, …)
    layout/        Nav, sidebar, footer
    feedback/      Feedback-domain components
    admin/         Admin-only components
    charts/        Recharts wrappers
  lib/             api client, auth helpers, utils, Zod schemas
  hooks/           Custom hooks
  store/           Zustand stores
  types/           Shared TypeScript types
public/
  fonts/           Self-hosted Instrument Serif WOFF2 files
```

## Phase status

Currently **phase 1 (scaffold + design tokens)**. Routing groups, pages, and components land in phases 3 (citizen) and 4 (admin).
