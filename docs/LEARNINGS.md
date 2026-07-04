# Learnings

## 1. Subagent Timeout Pattern Is Reliable at 600s

Both subagents timed out at 600s but produced ~90% complete code. The backend had all 10 modules, entities, services, and controllers. The frontend had all 12 pages, 8 services, shell, shared components, and guards. Only manual fix-up needed for:

- Routes configuration (empty app.routes.ts)
- Zoneless change detection config (missing provideZonelessChangeDetection)
- Badge/skeleton missing `computed` imports
- Property name mismatches between interfaces and templates

**Lesson:** Budget 15 min of manual fix-up after subagent timeout. The pattern is reliable but predictable.

## 2. Frontend Interface Mismatch Creates Build Errors

The backend subagent used `date` as a column name in TimeEntry entity, while the frontend subagent's interface used `startTime`. The frontend pages referenced `entry.date` which caused TS2339 errors because the interface said `startTime`.

**Lesson:** Ensure shared interfaces are synchronized between backend and frontend subagents. Either specify exact field names in both contexts, or accept ~5 min of property name alignment.

## 3. Angular 22 API Name Change: provideZonelessChangeDetection

In Angular 22, the function is `provideZonelessChangeDetection()` (not `provideExperimentalZonelessChangeDetection` which was the Angular 19 beta name). The old name causes a TS2724 error.

**Lesson:** Use `provideZonelessChangeDetection` in app.config.ts for Angular 22.

## 4. git init Must Run from Project Root

Setting up git from the root directory (not from apps/api or apps/web) ensures the monorepo structure is tracked correctly. The `.gitignore` at root covers both projects.

## 5. Invoice Creation Workflow Is Complex

The multi-step invoice creation (select client → select unbilled entries → preview → confirm) is the most complex frontend workflow in this project. It's currently a placeholder page. The full implementation requires:
- Loading unbilled time entries filtered by client
- Checkbox selection with project grouping
- Auto-calculation of subtotals (subtotal), taxes, and total
- Entry locking (marking entries as invoiced)
- Invoice number auto-generation (INV-YYYY-NNN)

**Lesson:** Invoice creation is a full-day feature for a single developer. Budget accordingly in future projects.

## 6. Design Specs From UX Designer Save ~15 Minutes

The complete design specs (PROJECT.md, USER_STORIES.md, COMPONENT_TREE.md, ROUTES.md, DATABASE_SCHEMA.md, DESIGN_SYSTEM.md, WIREFRAMES.md, FLOW_DIAGRAM.md) provided an exact blueprint. No Phase 1 needed — skipped the self-design phase entirely.

## 7. jsdom + better-sqlite3 Compatibility

The jest tests that pass use mock repositories, not real database connections. This is intentional — mock repos are faster and don't require database setup. The 19 tests pass in ~2 seconds.
