import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { BadgeComponent } from '../../shared/badge/badge.component';

@Component({
  selector: 'app-invoice-detail-page',
  standalone: true,
  imports: [RouterLink, BadgeComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-4">
      <a routerLink="/invoices" class="text-sm text-primary-500 hover:text-primary-600">&larr; Back to Invoices</a>
      @if (invoice(); as inv) {
        <div class="bg-surface rounded-xl border border-border shadow-xl p-8 paper-a4">
          <div class="flex justify-between items-start mb-8">
            <div>
              <h1 class="text-3xl font-bold text-text-primary">INVOICE</h1>
              <p class="text-lg font-mono text-text-secondary mt-1">{{ inv.invoiceNumber }}</p>
            </div>
            <app-badge [variant]="statusBadge(inv.status)">{{ inv.status }}</app-badge>
          </div>
          <div class="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-text-tertiary mb-1">Bill To</p>
              <p class="text-sm font-medium text-text-primary">{{ inv.clientName }}</p>
              <p class="text-sm text-text-secondary">{{ inv.clientEmail }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-text-tertiary">Issue Date: {{ inv.issuedDate }}</p>
              <p class="text-xs text-text-tertiary">Due Date: {{ inv.dueDate }}</p>
            </div>
          </div>
          <table class="w-full mb-8">
            <thead><tr class="border-b border-border">
              <th class="text-left py-2 text-xs font-medium text-text-tertiary uppercase">Description</th>
              <th class="text-right py-2 text-xs font-medium text-text-tertiary uppercase">Hours</th>
              <th class="text-right py-2 text-xs font-medium text-text-tertiary uppercase">Rate</th>
              <th class="text-right py-2 text-xs font-medium text-text-tertiary uppercase">Amount</th>
            </tr></thead>
            <tbody>
              @for (item of inv.lineItems; track item.id) {
                <tr class="border-b border-border-light">
                  <td class="py-3 text-sm text-text-primary">{{ item.description }}</td>
                  <td class="py-3 text-sm text-right font-mono text-text-primary">{{ item.hours }}</td>
                  <td class="py-3 text-sm text-right font-mono text-text-primary">\${{ item.rate.toFixed(2) }}</td>
                  <td class="py-3 text-sm text-right font-mono text-text-primary">\${{ item.amount.toFixed(2) }}</td>
                </tr>
              }
            </tbody>
          </table>
          <div class="ml-auto w-64 space-y-2">
            <div class="flex justify-between text-sm"><span class="text-text-secondary">Subtotal</span><span class="font-mono text-text-primary">\${{ inv.subtotal.toFixed(2) }}</span></div>
            <div class="flex justify-between text-sm"><span class="text-text-secondary">Tax ({{ inv.taxRate }}%)</span><span class="font-mono text-text-primary">\${{ inv.taxAmount.toFixed(2) }}</span></div>
            <div class="border-t border-border pt-2 flex justify-between"><span class="font-semibold text-text-primary">Total</span><span class="font-mono font-bold text-lg text-text-primary">\${{ inv.total.toFixed(2) }}</span></div>
          </div>
        </div>
      } @else {
        <div class="bg-surface rounded-xl border border-border p-12 text-center"><p class="text-text-secondary">Loading invoice...</p></div>
      }
    </div>
  `
})
export class InvoiceDetailPageComponent {
  private route = inject(ActivatedRoute);
  private invoiceService = inject(InvoiceService);
  readonly invoice = signal<any>(null);
  statusBadge(s: string): string { return {draft:'warning', sent:'primary', paid:'success', overdue:'danger'}[s] || 'default'; }
  constructor() { this.load(); }
  async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { await this.invoiceService.loadAll(); this.invoice.set(this.invoiceService.invoices().find(i => i.id === id)); }
  }
}
