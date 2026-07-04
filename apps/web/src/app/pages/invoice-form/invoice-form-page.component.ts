import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-invoice-form-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <a routerLink="/invoices" class="text-sm text-primary-500 hover:text-primary-600">&larr; Back to Invoices</a>
      <h1 class="text-2xl font-bold text-text-primary">New Invoice</h1>
      <div class="bg-surface rounded-xl border border-border p-6 shadow-card">
        <p class="text-text-secondary">Invoice creation form will allow selecting a client, choosing unbilled time entries, previewing totals, and confirming. This is a placeholder for the multi-step wizard described in the design specs.</p>
      </div>
    </div>
  `
})
export class InvoiceFormPageComponent {}
