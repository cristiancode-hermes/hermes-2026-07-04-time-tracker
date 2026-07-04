import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/error-state/error-state.component';
import { BadgeComponent } from '../../shared/badge/badge.component';

@Component({
  selector: 'app-invoices-page',
  standalone: true,
  imports: [RouterLink, SpinnerComponent, EmptyStateComponent, ErrorStateComponent, BadgeComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-text-primary">Invoices</h1>
          <p class="text-sm text-text-secondary mt-1">Manage your invoices</p>
        </div>
        <a routerLink="/invoices/new" class="inline-flex px-4 py-2 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600">+ New Invoice</a>
      </div>
      <div class="flex gap-2">
        @for (s of statusFilters; track s) {
          <button (click)="statusFilter.set(s)" class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors" [class.bg-primary-100]="statusFilter() === s" [class.text-primary-700]="statusFilter() === s" [class.bg-surface-tertiary]="statusFilter() !== s" [class.text-text-secondary]="statusFilter() !== s">{{ s === '' ? 'All' : s }}</button>
        }
      </div>
      @if (invoiceService.loading()) { <app-spinner label="Loading invoices..." /> }
      @else if (invoiceService.error()) { <app-error-state [message]="invoiceService.error()!" (onRetry)="load()" /> }
      @else if (filteredInvoices().length === 0) { <app-empty-state icon="📄" title="No invoices yet" message="Create your first invoice from tracked time entries." /> }
      @else {
        <div class="bg-surface rounded-xl border border-border overflow-hidden">
          <table class="w-full">
            <thead><tr class="border-b border-border bg-surface-secondary">
              <th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase">Number</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase">Client</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase">Date</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase">Status</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-text-secondary uppercase">Total</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-text-secondary uppercase">Actions</th>
            </tr></thead>
            <tbody>
              @for (inv of filteredInvoices(); track inv.id) {
                <tr class="border-b border-border last:border-0 hover:bg-surface-secondary cursor-pointer" [routerLink]="['/invoices', inv.id]">
                  <td class="px-4 py-3 text-sm font-mono text-text-primary">{{ inv.invoiceNumber }}</td>
                  <td class="px-4 py-3 text-sm text-text-primary">{{ inv.clientName }}</td>
                  <td class="px-4 py-3 text-sm text-text-secondary">{{ inv.issuedDate }}</td>
                  <td class="px-4 py-3"><app-badge [variant]="statusBadge(inv.status)">{{ inv.status }}</app-badge></td>
                  <td class="px-4 py-3 text-sm text-right font-mono text-text-primary">\${{ inv.total.toFixed(2) }}</td>
                  <td class="px-4 py-3 text-right"><button (click)="deleteInvoice(inv.id); $event.stopPropagation()" class="text-sm text-danger-500 hover:text-danger-600">Delete</button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class InvoicesPageComponent {
  readonly invoiceService = inject(InvoiceService);
  readonly router = inject(Router);
  readonly statusFilter = signal('');
  readonly statusFilters = ['', 'draft', 'sent', 'paid', 'overdue'];
  statusBadge(s: string): string { return {draft:'warning', sent:'primary', paid:'success', overdue:'danger'}[s] || 'default'; }
  readonly filteredInvoices = computed(() => {
    const s = this.statusFilter();
    if (!s) return this.invoiceService.invoices();
    return this.invoiceService.invoices().filter(i => i.status === s);
  });
  constructor() { this.invoiceService.loadAll(); }
  load(): void { this.invoiceService.loadAll(); }
  async deleteInvoice(id: string): Promise<void> { await this.invoiceService.delete(id); }
}
