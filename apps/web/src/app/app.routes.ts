import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { redirectIfAuthenticatedGuard } from './guards/redirect-if-authenticated.guard';

export const routes: Routes = [
  // Auth routes (no shell layout)
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login-page.component').then(m => m.LoginPageComponent),
    canActivate: [redirectIfAuthenticatedGuard],
    title: 'Login — TimeTracker'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register-page.component').then(m => m.RegisterPageComponent),
    canActivate: [redirectIfAuthenticatedGuard],
    title: 'Register — TimeTracker'
  },

  // App shell with sidebar + header
  {
    path: '',
    loadComponent: () => import('./shell/app-shell/app-shell.component').then(m => m.AppShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent),
        title: 'Dashboard — TimeTracker'
      },

      // Clients
      {
        path: 'clients',
        loadComponent: () => import('./pages/clients/clients-page.component').then(m => m.ClientsPageComponent),
        title: 'Clients — TimeTracker'
      },
      {
        path: 'clients/:id',
        loadComponent: () => import('./pages/client-detail/client-detail-page.component').then(m => m.ClientDetailPageComponent),
        title: 'Client Detail — TimeTracker'
      },

      // Projects
      {
        path: 'projects',
        loadComponent: () => import('./pages/projects/projects-page.component').then(m => m.ProjectsPageComponent),
        title: 'Projects — TimeTracker'
      },
      {
        path: 'projects/:id',
        loadComponent: () => import('./pages/project-detail/project-detail-page.component').then(m => m.ProjectDetailPageComponent),
        title: 'Project Detail — TimeTracker'
      },

      // Time Entries
      {
        path: 'time-entries',
        loadComponent: () => import('./pages/time-entries/time-entries-page.component').then(m => m.TimeEntriesPageComponent),
        title: 'Time Entries — TimeTracker'
      },

      // Invoices
      {
        path: 'invoices',
        loadComponent: () => import('./pages/invoices/invoices-page.component').then(m => m.InvoicesPageComponent),
        title: 'Invoices — TimeTracker'
      },
      {
        path: 'invoices/new',
        loadComponent: () => import('./pages/invoice-form/invoice-form-page.component').then(m => m.InvoiceFormPageComponent),
        title: 'New Invoice — TimeTracker'
      },
      {
        path: 'invoices/:id',
        loadComponent: () => import('./pages/invoice-detail/invoice-detail-page.component').then(m => m.InvoiceDetailPageComponent),
        title: 'Invoice Detail — TimeTracker'
      },

      // Reports
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports-page.component').then(m => m.ReportsPageComponent),
        title: 'Reports — TimeTracker'
      },
    ]
  },

  // 404 fallback
  { path: '**', redirectTo: 'dashboard' }
];
