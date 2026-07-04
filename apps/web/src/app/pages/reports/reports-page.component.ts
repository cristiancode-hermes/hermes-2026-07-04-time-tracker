import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-text-primary">Reports</h1>
      <div class="grid gap-4 md:grid-cols-3">
        <div class="bg-surface rounded-xl border border-border p-5 shadow-card">
          <p class="text-xs font-medium uppercase tracking-wide text-text-tertiary">Total Hours</p>
          <p class="text-3xl font-bold text-text-primary mt-1">0.0</p>
          <p class="text-xs text-text-secondary mt-1">Select a period to view</p>
        </div>
        <div class="bg-surface rounded-xl border border-border p-5 shadow-card">
          <p class="text-xs font-medium uppercase tracking-wide text-text-tertiary">Billable Amount</p>
          <p class="text-3xl font-bold text-text-primary mt-1">\$0.00</p>
          <p class="text-xs text-text-secondary mt-1">Select a period to view</p>
        </div>
        <div class="bg-surface rounded-xl border border-border p-5 shadow-card">
          <p class="text-xs font-medium uppercase tracking-wide text-text-tertiary">Entries</p>
          <p class="text-3xl font-bold text-text-primary mt-1">0</p>
          <p class="text-xs text-text-secondary mt-1">Select a period to view</p>
        </div>
      </div>
      <div class="bg-surface rounded-xl border border-border p-6 shadow-card">
        <p class="text-text-secondary">Report builder with period selection, breakdown by client/project, and CSV export will be fully implemented here.</p>
      </div>
    </div>
  `
})
export class ReportsPageComponent {}
