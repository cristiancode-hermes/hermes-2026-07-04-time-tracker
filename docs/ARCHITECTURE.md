# Architecture — Hermes Time Tracker

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Angular 22)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Auth     │ │ Dashboard│ │ Time     │ │ Invoice       │  │
│  │ Pages    │ │ + KPIs   │ │ Entries  │ │ Paper View    │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
│         │            │            │              │          │
│         └────────────┴────────────┴──────────────┘          │
│                        │ HTTP REST                          │
└────────────────────────┼────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────┐
│              NestJS API (http://localhost:3000)              │
│                         │                                    │
│  ┌──────────┐ ┌────────┴───────┐ ┌──────────────────┐       │
│  │ Auth     │ │ Controllers    │ │ Guards/Interceptors│      │
│  │ Module   │ │ (thin layer)   │ │ (JWT, Validation) │       │
│  └──────────┘ └────────┬───────┘ └──────────────────┘       │
│                        │                                     │
│  ┌─────────────────────┴──────────────────────────────┐      │
│  │            Service Layer (business logic)           │      │
│  │  Clients  │  Projects  │  TimeEntries  │  Timer    │      │
│  │  Invoices │  Dashboard │  Reports      │  Seed     │      │
│  └─────────────────────┬──────────────────────────────┘      │
│                        │                                     │
│  ┌─────────────────────┴──────────────────────────────┐      │
│  │         TypeORM + better-sqlite3 (SQLite)            │      │
│  │  6 entities: User, Client, Project, TimeEntry,      │      │
│  │              Invoice, InvoiceItem                    │      │
│  └────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow
1. User submits credentials → `POST /api/auth/login`
2. AuthService validates via bcryptjs → JWT signed
3. Token stored client-side, sent in `Authorization: Bearer` header
4. JwtAuthGuard validates on every protected route
5. User identity available via `@CurrentUser()` decorator

### Timer Flow (Key Feature)
1. User clicks "Start Timer" → selects project → `POST /api/timer/start`
2. Server stores active timer in memory (Map<userId, TimerState>)
3. Frontend TimerService starts `setInterval(1000)` updating `elapsedSeconds` signal
4. Timer indicator shown in navbar via singleton TimerService signal
5. User navigates freely — timer persists across routes (in-memory signal)
6. User clicks "Stop" → `POST /api/timer/stop` → duration calculated → TimeEntry saved
7. Dashboard signals automatically reflect new entry

### Dashboard Aggregation Flow
1. `GET /api/dashboard` → DashboardService runs 5 aggregation queries
2. COALESCE(SUM(duration), 0) for KPIs (SQLite-compatible)
3. Weekly chart: GROUP BY date, JOIN projects for billable amounts
4. Pending invoices: WHERE status IN ('draft', 'sent'), SUM(total)
5. Frontend DashboardService stores results in signals → computed() KPIs

### Invoice Status Machine
```
draft ──→ sent ──→ paid
                └──→ overdue ──→ paid
```
- `draft` → `sent`: Sets `sentAt` date
- `sent` → `paid`: Sets `paidAt` date
- `sent` → `overdue`: Automatic if due date passed
- `overdue` → `paid`: Sets `paidAt` date
- Status changes validated by `validTransitions` map
- Time entries marked `invoiced = true` when added to invoice

## Why This Architecture?

| Decision | Rationale |
|----------|-----------|
| Signal-based state | Angular 22 idiomatic, no zone.js overhead, simpler than RxJS for component state |
| SQLite dev / PostgreSQL prod | Zero-config development, Neon-ready for production |
| Server-side timer | Prevents timer loss on page refresh; in-memory Map for simplicity |
| TypeORM with object-syntax | Required for TypeORM 1.0 compatibility |
| `nest build --tsc` | SWC fails on TypeORM decorators; --tsc uses the TypeScript compiler |
| JWT over sessions | Stateless, works with mobile/web, simpler deployment |
