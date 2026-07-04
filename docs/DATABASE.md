# Database — Hermes Time Tracker

## Entities and Relationships

```
User 1──N Client
User 1──N Project
User 1──N Invoice
Client 1──N Project
Client 1──N Invoice
Project 1──N TimeEntry
Project 1──N InvoiceItem
Invoice 1──N InvoiceItem
TimeEntry 1──1 InvoiceItem (nullable)
```

## Entity Summary

| Entity | Columns | Key Relations | Indices |
|--------|---------|---------------|---------|
| User | 8 | clients, projects, invoices | email (UNIQUE) |
| Client | 8 | →User, projects, invoices | userId, (userId + name UNIQUE) |
| Project | 8 | →User, →Client, timeEntries, invoiceItems | userId, clientId, (userId + status) |
| TimeEntry | 8 | →User, →Project, →InvoiceItem (nullable) | userId, projectId, (userId + date), (userId + invoiced) |
| Invoice | 14 | →User, →Client, invoiceItems | invoiceNumber (UNIQUE), userId, clientId, status |
| InvoiceItem | 8 | →Invoice (CASCADE), →Project (SET NULL), →TimeEntry (SET NULL) | invoiceId, projectId, timeEntryId |

**Total: 6 entities, ~54 columns, 15 indices**

## Migration Strategy

### Development (SQLite)

```typescript
TypeOrmModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    type: 'better-sqlite3',
    database: config.get<string>('DATABASE_PATH', './data/timetracker.db'),
    entities: [User, Client, Project, TimeEntry, Invoice, InvoiceItem],
    synchronize: true, // Auto-sync for dev
  }),
});
```

TypeORM `synchronize: true` is used in development. The database file is stored at `apps/api/data/timetracker.db`.

### Production (Neon PostgreSQL)

To migrate to Neon PostgreSQL:

1. Install `pg` and `@nestjs/typeorm` (already installed)
2. Update TypeORM config:
```typescript
type: 'postgres',
url: config.get<string>('DATABASE_URL'),
ssl: { rejectUnauthorized: false },
entities: [/*...*/],
synchronize: false, // Use migrations
```

3. Run the SQL DDL from [DATABASE.md](#sql-ddl)
4. Migrate data from SQLite to PostgreSQL

### Key Queries

#### Dashboard KPIs

```sql
-- Hours Today
SELECT COALESCE(SUM(duration), 0) AS hours_today
FROM time_entries
WHERE user_id = ? AND date = date('now');

-- Hours This Week
SELECT COALESCE(SUM(duration), 0) AS hours_this_week
FROM time_entries
WHERE user_id = ?
  AND date >= date('now', 'weekday 0', '-6 days')
  AND date <= date('now');

-- Hours This Month
SELECT COALESCE(SUM(duration), 0) AS hours_this_month
FROM time_entries
WHERE user_id = ?
  AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now');
```

#### Invoice Totals

```sql
SELECT COUNT(*) AS pending_count,
       COALESCE(SUM(total), 0) AS pending_amount
FROM invoices
WHERE user_id = ? AND status IN ('draft', 'sent');
```

#### Weekly Chart

```sql
SELECT date, COALESCE(SUM(duration), 0) AS hours,
       COALESCE(SUM(duration * p.hourly_rate), 0) AS billable_amount
FROM time_entries te
JOIN projects p ON te.project_id = p.id
WHERE te.user_id = ?
  AND date >= date('now', '-6 days')
GROUP BY date
ORDER BY date;
```

## Neon-Specific Notes

- This schema is fully PostgreSQL-compatible
- All `TEXT` types map to PostgreSQL `TEXT`
- `REAL` for decimal values maps to PostgreSQL `REAL`
- `BOOLEAN` is supported natively
- `CreateDateColumn` / `UpdateDateColumn` produce `TIMESTAMPTZ`
- Neon Data API can be used for direct frontend reads with RLS policies
- pgvector can be added for future embedding-based features
