export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  clientName?: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on_hold' | 'archived';
  hourlyRate: number;
  currency: string;
  totalHours?: number;
  totalAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  id: string;
  clientId?: string;
  clientName?: string;
  projectId: string;
  projectName?: string;
  description: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  billable: boolean;
  invoiced: boolean;
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName?: string;
  clientCompany?: string;
  clientEmail?: string;
  clientAddress?: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  dueDate: string;
  issuedDate: string;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  hours: number;
  rate: number;
  amount: number;
  timeEntryIds?: string[];
}

export interface DashboardKPI {
  value: number;
  label: string;
  delta: number;
  deltaLabel: string;
}

export interface WeeklyChartData {
  day: string;
  hours: number;
  shortDay: string;
}

export interface ReportSummary {
  totalHours: number;
  totalAmount: number;
  billableHours: number;
  billableAmount: number;
  entryCount: number;
}

export interface ReportBreakdown {
  clientId: string;
  clientName: string;
  projects: {
    projectId: string;
    projectName: string;
    hours: number;
    amount: number;
    entryCount: number;
  }[];
  totalHours: number;
  totalAmount: number;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'archived';
export type ThemeMode = 'light' | 'dark';
