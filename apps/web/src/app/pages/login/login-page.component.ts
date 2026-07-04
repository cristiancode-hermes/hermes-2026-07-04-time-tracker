import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';
import { ToastComponent } from '../../shared/toast/toast.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink, ToastComponent],
  template: `
    <div class="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="bg-surface rounded-2xl shadow-card border border-border p-8">
          <div class="text-center mb-8">
            <div class="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center mx-auto mb-4">
              <span class="text-white font-bold text-lg">HT</span>
            </div>
            <h1 class="text-2xl font-bold text-text-primary">Welcome back</h1>
            <p class="text-sm text-text-secondary mt-1">Sign in to your Hermes Time Tracker account</p>
          </div>

          @if (authService.error()) {
            <div class="mb-4 p-3 rounded-lg bg-danger-50 border border-danger-200 text-sm text-danger-700">
              {{ authService.error() }}
            </div>
          }

          <form (ngSubmit)="onLogin()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">Email</label>
              <input
                [(ngModel)]="email"
                name="email"
                type="email"
                required
                class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">Password</label>
              <input
                [(ngModel)]="password"
                name="password"
                type="password"
                required
                class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              [disabled]="authService.loading()"
              class="w-full py-2.5 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              @if (authService.loading()) {
                <span class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              } @else {
                Sign in
              }
            </button>
          </form>

          <p class="text-center text-sm text-text-secondary mt-6">
            Don't have an account?
            <a routerLink="/register" class="text-primary-500 hover:text-primary-600 font-medium">Sign up</a>
          </p>
        </div>
      </div>
    </div>
    <app-toast />
  `,
})
export class LoginPageComponent {
  readonly authService = inject(AuthService);
  readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');

  async onLogin(): Promise<void> {
    const success = await this.authService.login(this.email(), this.password());
    if (success) {
      this.router.navigate(['/dashboard']);
    }
  }
}
