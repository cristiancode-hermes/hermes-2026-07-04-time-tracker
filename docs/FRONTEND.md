# Frontend Architecture — Hermes Time Tracker

## Signal Architecture

### State Management Pattern

All component and service state is managed with Angular signals:

```typescript
// Service pattern
@Injectable({ providedIn: 'root' })
export class ClientService {
  private http = inject(HttpClient);
  
  readonly clients = signal<Client[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  
  async loadAll(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.http.get<Client[]>('/api/clients'));
      this.clients.set(data);
    } catch (e) {
      this.error.set('Failed to load clients');
    } finally {
      this.loading.set(false);
    }
  }
}
```

### Component State with Signals

```typescript
@Component(...)
export class ClientsPageComponent {
  readonly searchQuery = signal('');
  readonly showModal = signal(false);
  
  readonly filteredClients = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.clientService.clients();
    return this.clientService.clients().filter(c => 
      c.name.toLowerCase().includes(q)
    );
  });
}
```

### Signal Communication Between Components

| Emitter | Receiver | Method | Purpose |
|---------|----------|--------|---------|
| TimerService | GlobalTimerIndicator (header) | Signal singleton | Show active timer in navbar |
| TimerService | TimeEntriesPage | Signal singleton | Show active timer card |
| ThemeService | All components | Signal singleton | Dark/light mode |
| ToastService | ToastComponent | Signal singleton | Global notifications |
| AuthService | Sidebar, Header, Guards | Signal singleton | Auth state |

## Zoneless Change Detection

The app uses `provideZonelessChangeDetection()` in `app.config.ts`:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
  ]
};
```

This means:
- No zone.js
- No `NgZone` service
- Change detection is triggered only when signals change
- Better performance for timer-based updates (setInterval only triggers components consuming the signal)

## Zoneless Caveats

1. **setInterval-based timers**: TimerService uses `setInterval(1000)` to update `elapsedSeconds` signal. With zoneless, only components consuming this signal are checked.
2. **ngModel**: Works with zoneless as long as the bound value is a signal or causes a signal update.
3. **no `NgZone.onMicrotaskEmpty`**: Use `afterNextRender` for post-render logic.

## Component Architecture

```
┌─────────────────────────────────────────────────────┐
│ AppComponent (router-outlet)                         │
├─────────────────────────────────────────────────────┤
│ LoginPage / RegisterPage (no shell, standalone)      │
├─────────────────────────────────────────────────────┤
│ AppShellComponent (sidebar + header + router-outlet)  │
│  ├── SidebarComponent (nav items, user info)          │
│  ├── HeaderComponent (breadcrumb, timer, theme)       │
│  └── RouterOutlet                                     │
│       ├── DashboardPageComponent                      │
│       ├── ClientsPageComponent                        │
│       ├── ClientDetailPageComponent                   │
│       ├── ProjectsPageComponent                       │
│       ├── ProjectDetailPageComponent                  │
│       ├── TimeEntriesPageComponent                    │
│       ├── InvoicesPageComponent                       │
│       ├── InvoiceDetailPageComponent                  │
│       ├── InvoiceFormPageComponent                    │
│       └── ReportsPageComponent                        │
├─────────────────────────────────────────────────────┤
│ ToastComponent (global overlay, top-right)            │
└─────────────────────────────────────────────────────┘
```

## Lazy Loading

All routes use `loadComponent` for lazy loading:

```typescript
{
  path: 'dashboard',
  loadComponent: () => import('./pages/dashboard/dashboard-page.component')
    .then(m => m.DashboardPageComponent),
}
```

This produces separate chunks for each page, reducing initial bundle size.

## Services (8 total)

| Service | Responsibilities |
|---------|-----------------|
| AuthService | Login, register, JWT management, current user signal |
| TimerService | Timer start/stop, elapsed seconds signal, active timer state |
| ClientService | CRUD clients with signal state |
| ProjectService | CRUD projects with signal state |
| TimeEntryService | CRUD time entries with signal state |
| InvoiceService | CRUD invoices, status transitions |
| DashboardService | KPI aggregation, weekly chart, pending invoices |
| ThemeService | Dark/light mode toggle, localStorage persistence |
| ToastService | Global toast notifications |
