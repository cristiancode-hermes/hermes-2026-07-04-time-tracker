# QA Report — Hermes Time Tracker

## Resumen
✅ **PASS** — Builds exitosos, 61 tests pasan (42 nuevos), proyecto sólido con buena documentación y estructura modular.

---

## Build

| Comando | Resultado |
|---------|-----------|
| `nest build` (API) | ✅ Pasó |
| `ng build` (Frontend) | ✅ Pasó |

**Advertencias de build (frontend):**
- 6 advertencias NG8113: componentes importados pero no usados en templates (ButtonComponent, SpinnerComponent, BadgeComponent, RouterLink en varios pages)
- 4 advertencias NG8107: optional chain (`?.`) innecesario en tipos que no incluyen null/undefined (`startTime?.substring`, `name?.charAt`)

---

## Tests

### Existentes (19 tests, 4 suites)
| Suite | Tests | Resultado |
|-------|-------|-----------|
| `auth.service.spec.ts` | 5 | ✅ Todos pasan |
| `invoices.service.spec.ts` | 7 | ✅ Todos pasan |
| `time-entries.service.spec.ts` | 5 | ✅ Todos pasan |
| `app.controller.spec.ts` | 1 | ✅ Pasa |

### Nuevos tests (42 tests, 5 suites)
| Suite | Tests | Resultado |
|-------|-------|-----------|
| `clients.service.spec.ts` | 10 | ✅ findAll, findOne, create, update, remove |
| `projects.service.spec.ts` | 11 | ✅ findAll con filtros, findOne, create, update, remove |
| `timer.service.spec.ts` | 9 | ✅ start/stop/getActive, timers concurrentes, edge cases |
| `dashboard.service.spec.ts` | 6 | ✅ KPIs, weekly chart, pending invoices, null handling |
| `reports.service.spec.ts` | 6 | ✅ Summary, CSV export, CSV escaping, empty edge case |

**Total: 61 tests, 9 suites, 0 fallos, 0 skip**

### Frontend tests
⚠️ **No existe configuración de testing en Angular.** El `angular.json` no tiene objetivo `test`, no hay dependencias de Karma/Jasmine, y los schematics tienen `skipTests: true`. No hay archivos `.spec.ts` en el frontend.

---

## Auditoría

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| Lint (API) | ⚠️ | **153 problemas** (116 errors, 37 warnings). Mayoría son `@typescript-eslint/no-unsafe-*` por uso de `any` en `req.user` y prefijos mock, y `prettier/prettier` por formato |
| Lint (Frontend) | ⚠️ | No hay configuración de ESLint. Solo advertencias del compilador Angular |
| Types | ⚠️ | `@typescript-eslint/strict` no está habilitado. Uso extensivo de `as any` en TypeORM relations. El frontend usa interfaces pero falta validación estricta |
| Código | ⚠️ | Uso generalizado de `as any` para TypeORM relaciones (`user: { id: userId } as any`). `any` en parámetros de tipo `req` en controllers. Duplicación de lógica `getHoursInRange` entre dashboard y reports |
| Documentación | ✅ | **Excelente.** 6 documentos: ARCHITECTURE.md, API.md, DATABASE.md, DECISIONS.md, FRONTEND.md, LEARNINGS.md. Todos completos y detallados |
| Edge cases | ⚠️ | Validación de DTOs con `class-validator` implementada. Sin embargo: no hay rate limiting, no hay sanitización de entrada SQL más allá de TypeORM, el timer service no persiste en DB (in-memory Map se pierde al reiniciar servidor) |
| Design System | ✅ | El CSS implementa fielmente los tokens del DESIGN_SYSTEM.md: colores, tipografía (Inter + JetBrains Mono), sombras, bordes, espaciado. Dark mode implementado con variables CSS |
| Seguridad | ⚠️ | JWT auth con Passport implementado. Pero: JWT no tiene expiry configurado explícito visible en auth service, no hay refresh token, no hay rate limiting en login/register (fuerza bruta) |

---

## Issues

### [🔥 Alta] TypeORM `as any` casts generalizados
**Dónde:** Todos los servicios (`clients.service.ts`, `projects.service.ts`, `time-entries.service.ts`, `invoices.service.ts`)
**Problema:** Las relaciones TypeORM se castean con `as any` en lugar de usar tipos correctos:
```typescript
user: { id: userId } as any
client: { id: dto.clientId } as any
```
**Solución:** Definir un tipo `Pick<User, 'id'>` y usar type assertion específica en vez de `any`. O migrar a TypeORM 1.0+ que soporta `{ id: userId }` sin cast.
**Impacto:** Pérdida de type safety en tiempo de compilación.

### [🔥 Alta] Sin tests en el frontend Angular
**Dónde:** `apps/web/`
**Problema:** El frontend tiene 43 archivos TypeScript (12 páginas, 8 servicios, 12 componentes compartidos, guards, shell) y **cero tests**. El angular.json no incluye target `test`.
**Solución:** Configurar Karma + Jasmine o migrar a Jest (jest-preset-angular). Priorizar tests de servicios (AuthService, TimerService, DashboardService) y componentes clave (Dashboard, TimeEntries, Clients).
**Impacto:** Cualquier regresión en el frontend pasará desapercibida.

### [⚠️ Media] 153 problemas de lint en la API
**Dónde:** `apps/api/src/`
**Problema:** 116 errores y 37 warnings. Mayoría son `@typescript-eslint/no-unsafe-*` (uso de `any` en `req.user`, mocks) y `prettier/prettier` (formato).
**Solución:** Ejecutar `eslint --fix` para los errores de prettier (33 auto-fixables). Para `any` en controllers, crear un tipo `RequestWithUser` genérico que extienda `Request` con `user: JwtPayload`.
**Impacto:** Error de lint rompe CI si se configura, yoculta bugs reales.

### [⚠️ Media] Servicios Dashboard y Reports duplican lógica
**Dónde:** `dashboard.service.ts:81-94`, `reports.service.ts:112-139`
**Problema:** `getHoursInRange` y `getBillableHoursInRange` están implementados idénticamente en ambos servicios.
**Solución:** Extraer a un `TimeEntryQueryService` compartido o un mixin. ~15 líneas duplicadas.
**Impacto:** Mantenimiento duplicado — cambiar una query requiere actualizar dos archivos.

### [⚠️ Media] Timer in-memory no persiste
**Dónde:** `timer.service.ts:11`
**Problema:** El timer activo se almacena en un `Map<string, ActiveTimer>` en memoria. Si el servidor se reinicia, todos los timers activos se pierden.
**Solución:** Persistir timer activo en DB (tabla `active_timers` con userId, projectId, startedAt). El frontend ya maneja localStorage como fallback.
**Impacto:** Pérdida de datos de tiempo no registrado en caso de reinicio del servidor.

### [📝 Baja] Sin expiry configurado en JWT
**Dónde:** `auth.service.ts:38,58`
**Problema:** `this.jwtService.sign({ sub: user.id, email: user.email })` no especifica `expiresIn`. Usa el default de `@nestjs/jwt` (ninguno).
**Solución:** Configurar `expiresIn: '7d'` o similar en JwtModule.register() o en cada sign().
**Impacto:** Tokens JWT no expiran nunca (a menos que se configure globalmente en JwtModule).

### [📝 Baja] Componentes no usados en imports
**Dónde:** DashboardPageComponent, ClientsPageComponent, TimeEntriesPageComponent, ReportsPageComponent
**Problema:** NG8113 warnings: componentes importados pero no referenciados en templates.
**Solución:** Eliminar imports no utilizados.
**Impacto:** Aumento innecesario de bundle size.

### [📝 Baja] Optional chain innecesario
**Dónde:** `time-entries-page.component.ts:55`, `project-detail-page.component.ts:40`, `header.component.ts:86`, `sidebar.component.ts:48`
**Problema:** NG8107 warnings: `?.` en tipos que no admiten null.
**Solución:** Reemplazar `?.` con `.` directo.
**Impacto:** Código engañoso sobre la nulabilidad real.

---

## Tests nuevos (detalle)

Los 42 tests nuevos siguen el patrón RED-GREEN de los existentes (mocks de repositorios con Jest, `Test.createTestingModule`):

### `clients.service.spec.ts` — 10 tests
| Test | Qué cubre |
|------|-----------|
| `findAll: paginated clients` | Paginación correcta con findAndCount |
| `findAll: search filter` | Filtro LIKE por nombre |
| `findAll: empty result` | Array vacío cuando no hay datos |
| `findOne: with projects` | Relación con projects incluida |
| `findOne: not found` | NotFoundException |
| `create: new client` | Creación con userId |
| `update: existing` | Actualización parcial |
| `update: not found` | NotFoundException en update |
| `remove: existing` | Eliminación correcta |
| `remove: not found` | NotFoundException en remove |

### `projects.service.spec.ts` — 11 tests
| Test | Qué cubre |
|------|-----------|
| `findAll: paginated` | Paginación + relación client |
| `findAll: filter by clientId` | Filtro exacto por cliente |
| `findAll: filter by status` | Filtro por estado |
| `findAll: empty` | Sin datos |
| `findOne: with relations` | Client + timeEntries |
| `findOne: not found` | NotFoundException |
| `create: with client` | Creación con relación |
| `update: existing` | Actualización campos |
| `update: not found` | NotFoundException |
| `remove: existing` | Eliminación |
| `remove: not found` | NotFoundException |

### `timer.service.spec.ts` — 9 tests
| Test | Qué cubre |
|------|-----------|
| `start: returns active state` | Inicio correcto con elapsed=0 |
| `start: overwrites existing` | Reemplazo de timer activo |
| `start: concurrent users` | Timers independientes por usuario |
| `start: without description` | Descripción null permitida |
| `stop: returns duration` | Cálculo correcto de duración |
| `stop: no timer` | Null si no hay timer |
| `stop: clears timer` | getActive retorna null tras stop |
| `getActive: with elapsed` | Cálculo de horas transcurridas |
| `getActive: no timer` | Null sin timer activo |

### `dashboard.service.spec.ts` — 6 tests
| Test | Qué cubre |
|------|-----------|
| `getDashboard: KPIs` | 5 KPIs retornados correctamente |
| `getDashboard: zero values` | Sin datos retorna 0 |
| `getDashboard: null raw` | getRawOne null manejado |
| `getWeeklyChart: 7 days` | 7 días con formato correcto |
| `getPendingInvoices: sent+overdue` | Filtro correcto |
| `getPendingInvoices: empty` | Sin pendientes |

### `reports.service.spec.ts` — 6 tests
| Test | Qué cubre |
|------|-----------|
| `getSummary: project grouping` | Agrupación por proyecto y cálculo de horas |
| `getSummary: non-billable` | Diferencia billable/no-billable |
| `getSummary: total invoiced` | Excluye facturas draft |
| `exportCsv: header+rows` | Formato CSV correcto |
| `exportCsv: escaping` | Comillas y commas escapados |
| `exportCsv: empty` | Solo header sin datos |

---

## Resumen de cobertura

| Servicio | Tests antes | Tests después | Cobertura de métodos |
|----------|------------|--------------|---------------------|
| AuthService | 5 | 5 | register (2), login (3) — completo |
| ClientsService | 0 | 10 | findAll (3), findOne (2), create (1), update (2), remove (2) |
| ProjectsService | 0 | 11 | findAll (4), findOne (2), create (1), update (2), remove (2) |
| TimeEntriesService | 5 | 5 | findAll (2), create (1), findOne (2) |
| TimerService | 0 | 9 | start (4), stop (3), getActive (2) |
| InvoicesService | 7 | 7 | create (1), updateStatus (5), findOne (2) |
| DashboardService | 0 | 6 | getDashboard (3), getWeeklyChart (1), getPendingInvoices (2) |
| ReportsService | 0 | 6 | getSummary (3), exportCsv (3) |
| AppController | 1 | 1 | root (1) |
| **Total** | **19** | **61** | **+42 tests** |

Sin cobertura: Controllers (solo AppController), Guards, AuthController, TimerController, ClientsController, ProjectsController, JwtStrategy, SeedService.
