# API Reference — Hermes Time Tracker

Base URL: `http://localhost:3000/api`
Swagger UI: `http://localhost:3000/api/docs`

## Authentication

All protected endpoints require `Authorization: Bearer <token>` header.

### POST /api/auth/register

Register a new user.

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword"
}
```

**Response:** `{ "accessToken": "jwt...", "user": { "id": "...", "email": "...", "name": "..." } }`

### POST /api/auth/login

```json
{ "email": "user@example.com", "password": "securepassword" }
```

**Response:** `{ "accessToken": "jwt...", "user": { "id": "...", "email": "...", "name": "..." } }`

### GET /api/auth/me

**Response:** `{ "id": "...", "email": "...", "name": "...", "defaultHourlyRate": 75, ... }`

---

## Clients

### GET /api/clients

Query params: `?search=&page=1&limit=10`

**Response:**
```json
{
  "data": [{ "id": "...", "name": "Acme Corp", "email": "contact@acme.com", "company": "Acme", "phone": "+123", "notes": null, "createdAt": "...", "updatedAt": "..." }],
  "total": 1, "page": 1, "limit": 10
}
```

### POST /api/clients

```json
{ "name": "Acme Corp", "email": "contact@acme.com", "company": "Acme", "phone": "+123", "notes": "Important client" }
```

### GET /api/clients/:id

Returns single Client.

### PATCH /api/clients/:id

```json
{ "name": "Updated Name", "email": "new@acme.com" }
```

### DELETE /api/clients/:id

**Response:** `{ "deleted": true }`

---

## Projects

### GET /api/projects

Query params: `?clientId=&status=&search=&page=1&limit=10`

**Response:**
```json
{
  "data": [{ "id": "...", "name": "Website Redesign", "description": "...", "hourlyRate": 75, "currency": "USD", "status": "active", "clientId": "...", "clientName": "Acme Corp", "totalHours": 42.5, "createdAt": "...", "updatedAt": "..." }],
  "total": 1, "page": 1, "limit": 10
}
```

### POST /api/projects

```json
{ "name": "New Project", "description": "...", "clientId": "...", "hourlyRate": 75, "currency": "USD", "status": "active" }
```

### GET /api/projects/:id

Returns project with computed totals.

### PATCH /api/projects/:id

Partial update.

### DELETE /api/projects/:id

---

## Time Entries

### GET /api/time-entries

Query params: `?from=2026-07-01&to=2026-07-04&projectId=&clientId=&search=&page=1&limit=20`

### POST /api/time-entries

```json
{ "projectId": "...", "description": "Worked on feature X", "date": "2026-07-04", "duration": 3.5, "billable": true }
```

### PATCH /api/time-entries/:id

Partial update.

### DELETE /api/time-entries/:id

---

## Timer

### POST /api/timer/start

```json
{ "projectId": "...", "description": "Working on design" }
```

**Response:** `{ "startedAt": "...", "projectId": "...", "projectName": "Website Redesign" }`

### POST /api/timer/stop

**Response:** `{ "id": "...", "duration": 1.5, "date": "2026-07-04", "projectId": "...", "description": "..." }`

### GET /api/timer/active

**Response:** `{ "startedAt": "...", "projectId": "...", "projectName": "..." }` or `null`

---

## Invoices

### GET /api/invoices

Query params: `?status=draft&clientId=&from=&to=&page=1&limit=10`

### POST /api/invoices

```json
{
  "clientId": "...",
  "dueDate": "2026-08-04",
  "notes": "Payment due within 30 days",
  "taxRate": 16,
  "entryIds": ["entry-1", "entry-2", "entry-3"]
}
```

### GET /api/invoices/:id

Returns invoice with line items and client info.

### PATCH /api/invoices/:id/status

```json
{ "status": "sent" }
```

### DELETE /api/invoices/:id

Only allowed for `draft` status invoices.

---

## Dashboard

### GET /api/dashboard

**Response:**
```json
{
  "kpiToday": { "hours": 3.5, "delta": 15, "deltaLabel": "+15% vs yesterday" },
  "kpiWeek": { "hours": 22.5, "delta": 8, "deltaLabel": "+8% vs last week" },
  "kpiMonth": { "hours": 85.0, "delta": -5, "deltaLabel": "-5% vs last month" },
  "pendingInvoices": { "count": 3, "totalAmount": 2450.00 },
  "weeklyChart": [{ "day": "2026-07-04", "hours": 3.5, "shortDay": "Fri" }],
  "recentEntries": [{ /* TimeEntry */ }]
}
```

### GET /api/dashboard/weekly-chart

### GET /api/dashboard/pending-invoices

---

## Reports

### GET /api/reports/summary

Query params: `?period=week|month|custom&from=2026-07-01&to=2026-07-04`

**Response:**
```json
{
  "totalHours": 42.5,
  "totalBillable": 3187.50,
  "byClient": [{ "clientName": "Acme Corp", "hours": 25.0, "amount": 1875.00 }],
  "byProject": [{ "projectName": "Website", "hours": 15.0, "amount": 1125.00 }]
}
```

### GET /api/reports/export

Same query params as summary. Returns CSV file.
