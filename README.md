# Hermes Time Tracker

> **Track time like a pro. Invoice like a boss.**

A full-stack time tracking and invoicing platform for freelancers and small businesses. Track billable hours, manage projects and clients, and generate professional invoices.

## Features

- ⏱ **Live Timer** — Start/stop timer with project selection, persistent across navigation
- 📊 **Dashboard KPIs** — Hours today, this week, pending invoices with visual charts
- 👥 **Client Management** — CRUD with search, pagination, company details
- 📁 **Project Management** — Track projects per client with hourly rates and status
- 🧾 **Invoice Generation** — Create invoices from time entries with tax support
- 📈 **Reports** — Period-based summaries with CSV export
- 🌙 **Dark Mode** — Toggle between light and dark themes
- 🔐 **JWT Authentication** — Secure login and registration

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 22 (Signals, Zoneless, Tailwind CSS v4) |
| Backend | NestJS + TypeORM + SQLite (Neon/PostgreSQL-ready) |
| Auth | JWT with Passport.js + bcryptjs |
| Testing | Jest (19 unit tests) |
| CI/CD | GitHub Actions workflow YAML |

## Architecture

```
hermes-2026-07-04-time-tracker/
├── apps/
│   ├── api/              # NestJS backend (10 modules)
│   │   ├── src/
│   │   │   ├── auth/         # JWT auth, guards, strategies
│   │   │   ├── clients/      # Client CRUD
│   │   │   ├── projects/     # Project CRUD
│   │   │   ├── time-entries/ # Time entry CRUD
│   │   │   ├── timer/        # Live timer start/stop
│   │   │   ├── invoices/     # Invoice CRUD + status transitions
│   │   │   ├── dashboard/    # KPI aggregation queries
│   │   │   ├── reports/      # Period summaries + CSV export
│   │   │   ├── entities/     # 6 TypeORM entities
│   │   │   └── seed/         # Seed data module
│   │   └── test/
│   └── web/              # Angular 22 frontend (16 routes)
│       └── src/app/
│           ├── pages/        # 12 lazy-loaded page components
│           ├── shell/        # App shell (sidebar + header)
│           ├── shared/       # 12 reusable components
│           ├── services/     # 8 signal-based services
│           └── guards/       # Auth guards
├── docs/                 # Documentation
└── .gitignore
```

## Prerequisites

- Node.js ≥ 22
- npm ≥ 10

## Local Setup

### 1. Clone and install

```bash
cd apps/api && npm install
cd apps/web && npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Database (SQLite, included)

The app uses SQLite via `better-sqlite3` for development. The database file is auto-created at `apps/api/data/timetracker.db`.

### 4. Seed data

```bash
cd apps/api
npm run start:seed
```

This creates:
- 2 demo users (demo@example.com / password123, carlos@example.com / password123)
- 3 clients with 5 projects
- 20+ time entries across the last 14 days
- 2 invoices (1 draft, 1 sent)

### 5. Run

**Backend:**
```bash
cd apps/api
npm run start:dev    # http://localhost:3000
# Swagger docs: http://localhost:3000/api/docs
```

**Frontend:**
```bash
cd apps/web
ng serve             # http://localhost:4200
```

### 6. Build for production

```bash
cd apps/api && npm run build
cd apps/web && ng build
```

## PostgreSQL Migration (Production)

To switch from SQLite to Neon PostgreSQL:

1. Set `DATABASE_URL` in `.env`
2. Install `pg` driver: `npm install pg`
3. Update `app.module.ts` TypeORM config to use `type: 'postgres'`
4. Run SQL DDL from `docs/DATABASE.md`

## API Overview

| Module | Base Path | Endpoints |
|--------|-----------|-----------|
| Auth | `/api/auth` | register, login, me |
| Clients | `/api/clients` | CRUD + search + pagination |
| Projects | `/api/projects` | CRUD + filters + totals |
| Time Entries | `/api/time-entries` | CRUD + date filters + pagination |
| Timer | `/api/timer` | start, stop, active |
| Invoices | `/api/invoices` | CRUD + status transitions |
| Dashboard | `/api/dashboard` | KPIs, weekly chart, pending invoices |
| Reports | `/api/reports` | summary, export CSV |

Full API reference: [docs/API.md](docs/API.md)

## Design System

The UI uses a custom design system inspired by Linear (tool-first dark precision) with financial touches from Stripe:

- Indigo primary (#6366f1) for actions and links
- Emerald accent (#10b981) for success states and active timers
- Dark mode via CSS custom properties
- Inter + JetBrains Mono typography
- Custom shadow, radius, and spacing scales

Full design tokens: [docs/FRONTEND.md](docs/FRONTEND.md)

## Roadmap

- [ ] **Invoice form** — Multi-step invoice creation wizard with time entry selection
- [ ] **CSV export** — Full CSV export for reports
- [ ] **Team collaboration** — Multi-user per organization
- [ ] **Email notifications** — Send invoices via email
- [ ] **PDF generation** — Professional PDF invoice download
- [ ] **SSE real-time** — Live dashboard updates when timer stops
- [ ] **Time entry tags/categories** — Better organization
- [ ] **Budget vs actual** — Compare estimated vs tracked hours

## License

MIT
