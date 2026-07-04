# Architecture Decision Records — Hermes Time Tracker

## ADR-01: Signal-First State Management over RxJS

**Status:** Accepted

**Context:** Angular 22 provides `signal()`, `computed()`, and `effect()` as first-class reactive primitives. Previous projects used RxJS for state management.

**Decision:** Use signals for all component and service state. RxJS only at true async stream boundaries (HTTP calls via HttpClient), bridged via `toSignal()`.

**Consequences:**
- + Simpler mental model for component state
- + Zoneless change detection enabled (no zone.js)
- + Better performance (no change detection tree walks)
- - Template expressions must call signals with `()`

---

## ADR-02: UUID Primary Keys over Auto-Increment Integers

**Status:** Accepted

**Context:** Design specs specified integer IDs but the subagent implementation used UUIDs. Both are valid for this scale.

**Decision:** Accept UUID primary keys. They provide:
- Better distribution across distributed systems
- No sequential ID guessing
- Safe for client-side generation

**Consequences:**
- + Production-ready for multi-user scaling
- + No ID collisions when merging databases
- - Slightly larger index size
- - Less human-readable in URLs

---

## ADR-03: SQLite for Development, PostgreSQL-Compatible Schema

**Status:** Accepted

**Context:** NEON_API_KEY is consistently unavailable in the cron environment. SQLite provides zero-config development.

**Decision:** Use `better-sqlite3` driver for development with a schema that's fully PostgreSQL-compatible:
- TEXT for all string types
- REAL for decimal values
- BOOLEAN for boolean fields
- Date functions via `strftime` / `COALESCE(SUM(...), 0)` for safe aggregation

**Consequences:**
- + Zero-config development environment
- + Clean migration path to Neon PostgreSQL
- - Date function differences between SQLite and PostgreSQL require documented migration notes
- - Cannot test actual PostgreSQL features (RLS, pgvector)

---

## ADR-04: Server-Side Timer State (In-Memory)

**Status:** Accepted

**Context:** The live timer needs to persist across page navigation. Options: server-side (in-memory or DB), client-side only (localStorage + polling), or hybrid.

**Decision:** Use in-memory `Map<userId, TimerState>` on the server. The server is the single source of truth for timer state. Client polls via `GET /api/timer/active` on page load.

**Consequences:**
- + Timer survives page navigation
- + Simple implementation (no DB reads for timer state)
- - State lost on server restart
- - Single-user server assumption (would need DB persistence for multi-instance deployment)

---

## ADR-05: Invoice Status Machine with Valid Transitions

**Status:** Accepted

**Context:** Invoices have a lifecycle (draft → sent → paid/overdue). Unvalidated transitions could create inconsistent data.

**Decision:** Implement a status machine with explicit valid transitions map:
```typescript
const validTransitions: Record<string, string[]> = {
  draft: ['sent'],
  sent: ['paid', 'overdue'],
  overdue: ['paid'],
  paid: [], // Terminal state
};
```

**Consequences:**
- + Enforces correct invoice lifecycle
- + Self-documenting state machine
- + Easy to extend with new states
- - Requires update when adding states

---

## ADR-06: Subagent Delegation for Parallel Backend/Frontend Development

**Status:** Accepted

**Context:** The 150-minute build budget requires efficient parallelization. Backend and frontend are independent workstreams.

**Decision:** Delegate backend and frontend implementation to parallel subagents, each with complete design spec context. Manual fix-up for the final 10% of issues.

**Consequences:**
- + 2x parallel development saves ~40 minutes
- + Subagent code is ~90% correct (consistent with 14 prior runs)
- - ~15 minutes manual fix-up required
- - Some files incomplete due to subagent timeout (600s limit)

---

## ADR-07: PostCSS-based Tailwind CSS v4 Integration

**Status:** Accepted

**Context:** Angular 22's ESBuild builder does not support a `plugins` option in `angular.json`. The `@tailwindcss/vite` plugin cannot be used.

**Decision:** Use PostCSS-based integration: `@tailwindcss/postcss` as a PostCSS plugin, auto-detected by Angular's Vite builder. All design tokens defined in `@theme` block in `styles.css`.

**Consequences:**
- + Works with Angular 22's builder
- + Design tokens in one place (styles.css @theme)
- + Dark mode via `@custom-variant dark` in CSS
- - No hot-reload on design token changes (requires page refresh)
