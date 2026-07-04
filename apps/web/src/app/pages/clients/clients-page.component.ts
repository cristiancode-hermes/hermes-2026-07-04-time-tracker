import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { SearchInputComponent } from '../../shared/search-input/search-input.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/error-state/error-state.component';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [RouterLink, SearchInputComponent, EmptyStateComponent, ErrorStateComponent, SpinnerComponent, ModalComponent, ButtonComponent, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-text-primary">Clients</h1>
          <p class="text-sm text-text-secondary mt-1">Manage your clients</p>
        </div>
        <button (click)="openCreateModal()" class="px-4 py-2 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors">
          + New Client
        </button>
      </div>

      <app-search-input
        placeholder="Search clients..."
        [value]="searchQuery()"
        (onSearch)="onSearch($event)"
      />

      @if (clientService.loading()) {
        <app-spinner label="Loading clients..." />
      } @else if (clientService.error()) {
        <app-error-state [message]="clientService.error()!" (onRetry)="load()" />
      } @else if (filteredClients().length === 0) {
        <app-empty-state icon="👥" title="No clients yet" message="Create your first client to start tracking time." />
      } @else {
        <div class="bg-surface rounded-xl border border-border overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border bg-surface-secondary">
                <th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase">Name</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase">Email</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase">Company</th>
                <th class="text-right px-4 py-3 text-xs font-medium text-text-secondary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (client of filteredClients(); track client.id) {
                <tr class="border-b border-border last:border-0 hover:bg-surface-secondary transition-colors cursor-pointer" [routerLink]="['/clients', client.id]">
                  <td class="px-4 py-3 text-sm font-medium text-text-primary">{{ client.name }}</td>
                  <td class="px-4 py-3 text-sm text-text-secondary">{{ client.email }}</td>
                  <td class="px-4 py-3 text-sm text-text-secondary">{{ client.company || '-' }}</td>
                  <td class="px-4 py-3 text-right">
                    <button (click)="openEditModal(client); $event.stopPropagation()" class="text-sm text-primary-500 hover:text-primary-600 mr-3">Edit</button>
                    <button (click)="confirmDelete(client); $event.stopPropagation()" class="text-sm text-danger-500 hover:text-danger-600">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Create/Edit Modal -->
      <app-modal [isOpen]="showModal()" [title]="editingClient() ? 'Edit Client' : 'New Client'" (onClose)="closeModal()">
        <form (ngSubmit)="saveClient()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Name *</label>
            <input [(ngModel)]="formData.name" name="name" required class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Email *</label>
            <input [(ngModel)]="formData.email" name="email" type="email" required class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Company</label>
            <input [(ngModel)]="formData.company" name="company" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Phone</label>
            <input [(ngModel)]="formData.phone" name="phone" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Notes</label>
            <textarea [(ngModel)]="formData.notes" name="notes" rows="3" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea>
          </div>
          <div class="flex gap-3 justify-end pt-2">
            <button type="button" (click)="closeModal()" class="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-primary hover:bg-surface-tertiary">Cancel</button>
            <button type="submit" class="px-4 py-2 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600">{{ editingClient() ? 'Update' : 'Create' }}</button>
          </div>
        </form>
      </app-modal>

      <!-- Delete Confirm -->
      @if (deletingClient()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="deletingClient.set(null)"></div>
          <div class="relative w-full max-w-md bg-surface rounded-2xl shadow-modal border border-border p-6">
            <h3 class="text-lg font-semibold text-text-primary mb-2">Delete Client</h3>
            <p class="text-sm text-text-secondary mb-6">Are you sure you want to delete "{{ deletingClient()?.name }}"? This action cannot be undone.</p>
            <div class="flex gap-3 justify-end">
              <button (click)="deletingClient.set(null)" class="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-primary hover:bg-surface-tertiary">Cancel</button>
              <button (click)="deleteClient()" class="px-4 py-2 text-sm font-medium rounded-lg bg-danger-500 text-white hover:bg-danger-600">Delete</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ClientsPageComponent {
  readonly clientService = inject(ClientService);
  readonly router = inject(Router);

  readonly searchQuery = signal('');
  readonly showModal = signal(false);
  readonly editingClient = signal<any>(null);
  readonly deletingClient = signal<any>(null);

  readonly formData = {
    name: signal(''),
    email: signal(''),
    company: signal(''),
    phone: signal(''),
    notes: signal(''),
  };

  readonly filteredClients = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.clientService.clients();
    return this.clientService.clients().filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q)
    );
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.clientService.loadAll();
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  openCreateModal(): void {
    this.editingClient.set(null);
    this.resetForm();
    this.showModal.set(true);
  }

  openEditModal(client: any): void {
    this.editingClient.set(client);
    this.formData.name.set(client.name);
    this.formData.email.set(client.email);
    this.formData.company.set(client.company || '');
    this.formData.phone.set(client.phone || '');
    this.formData.notes.set(client.notes || '');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingClient.set(null);
  }

  resetForm(): void {
    this.formData.name.set('');
    this.formData.email.set('');
    this.formData.company.set('');
    this.formData.phone.set('');
    this.formData.notes.set('');
  }

  async saveClient(): Promise<void> {
    const data = {
      name: this.formData.name(),
      email: this.formData.email(),
      company: this.formData.company() || undefined,
      phone: this.formData.phone() || undefined,
      notes: this.formData.notes() || undefined,
    };
    if (this.editingClient()) {
      await this.clientService.update(this.editingClient().id, data);
    } else {
      await this.clientService.create(data);
    }
    this.closeModal();
  }

  confirmDelete(client: any): void {
    this.deletingClient.set(client);
  }

  async deleteClient(): Promise<void> {
    if (this.deletingClient()) {
      await this.clientService.delete(this.deletingClient().id);
      this.deletingClient.set(null);
    }
  }
}
