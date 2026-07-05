import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TimeEntryService } from './time-entry.service';
import { ToastService } from './toast.service';
import { TimeEntry } from '../interfaces';
import { environment } from '../environments/environment';

describe('TimeEntryService', () => {
  let service: TimeEntryService;
  let httpMock: HttpTestingController;
  let toastService: ToastService;

  const now = new Date();
  const mockEntries: TimeEntry[] = [
    {
      id: '1',
      projectId: 'p1',
      projectName: 'Project Alpha',
      description: 'Work on feature X',
      startTime: now.toISOString(), // today
      duration: 3600,
      billable: true,
      invoiced: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: '2',
      projectId: 'p2',
      projectName: 'Project Beta',
      description: 'Meeting',
      startTime: now.toISOString(), // also today (this week)
      duration: 1800,
      billable: false,
      invoiced: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: '3',
      projectId: 'p1',
      projectName: 'Project Alpha',
      description: 'Bug fix',
      startTime: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago (last week)
      duration: 2700,
      billable: true,
      invoiced: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  const expectedWeekTotal = mockEntries[0].duration + mockEntries[1].duration; // 3600 + 1800 = 5400

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        ToastService,
      ],
    });

    service = TestBed.inject(TimeEntryService);
    httpMock = TestBed.inject(HttpTestingController);
    toastService = TestBed.inject(ToastService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('computed signals', () => {
    beforeEach(() => {
      // Manually set entries without HTTP
      (service as any).entries.set(mockEntries);
    });

    it('should compute todayTotal from entries starting today', () => {
      const total = service.todayTotal();
      expect(total).toBe(5400); // entry 1 (3600) + entry 2 (1800)
    });

    it('should compute weekTotal from entries this week', () => {
      const total = service.weekTotal();
      expect(total).toBe(expectedWeekTotal);
    });

    it('should compute billableTotal from billable entries only', () => {
      // Entry 1 (billable, 3600) + Entry 3 (billable, 2700) = 6300
      const total = service.billableTotal();
      expect(total).toBe(6300);
    });

    it('should compute unInvoicedEntries from non-invoiced entries', () => {
      const unInvoiced = service.unInvoicedEntries();
      expect(unInvoiced.length).toBe(2); // entries 1 and 3
      expect(unInvoiced.every((e) => !e.invoiced)).toBe(true);
    });

    it('should return 0 for todayTotal when no entries exist', () => {
      (service as any).entries.set([]);
      expect(service.todayTotal()).toBe(0);
    });

    it('should return 0 for weekTotal when no entries exist', () => {
      (service as any).entries.set([]);
      expect(service.weekTotal()).toBe(0);
    });
  });

  describe('loadAll', () => {
    it('should fetch time entries and update signal', async () => {
      const loadPromise = service.loadAll();

      const req = httpMock.expectOne((r) =>
        r.url === `${environment.apiUrl}/time-entries` && r.method === 'GET'
      );
      expect(req.request.params.keys().length).toBe(0);

      req.flush(mockEntries);
      await loadPromise;

      expect(service.entries()).toEqual(mockEntries);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBeNull();
    });

    it('should pass query params when filters are provided', async () => {
      const loadPromise = service.loadAll({
        projectId: 'p1',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        invoiced: false,
      });

      const req = httpMock.expectOne((r) =>
        r.url === `${environment.apiUrl}/time-entries` && r.method === 'GET'
      );
      expect(req.request.params.get('projectId')).toBe('p1');
      expect(req.request.params.get('startDate')).toBe('2025-01-01');
      expect(req.request.params.get('endDate')).toBe('2025-12-31');
      expect(req.request.params.get('invoiced')).toBe('false');

      req.flush(mockEntries);
      await loadPromise;
    });

    it('should handle HTTP error and set error signal', async () => {
      const loadPromise = service.loadAll();

      const req = httpMock.expectOne(`${environment.apiUrl}/time-entries`);
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });

      await loadPromise;

      expect(service.error()).toBe('Server error');
      expect(service.loading()).toBe(false);
      expect(service.entries()).toEqual([]);
    });
  });

  describe('create', () => {
    it('should POST a new time entry and add it to the signal list', async () => {
      const newEntryData = {
        projectId: 'p1',
        description: 'New task',
        duration: 1200,
        billable: true,
        startTime: new Date().toISOString(),
      };
      const createdEntry: TimeEntry = {
        id: 'new-id',
        ...newEntryData,
        invoiced: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const createPromise = service.create(newEntryData);

      const req = httpMock.expectOne(`${environment.apiUrl}/time-entries`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newEntryData);
      req.flush(createdEntry);

      const result = await createPromise;
      expect(result).toEqual(createdEntry);
      expect(service.entries()).toContain(createdEntry);
    });

    it('should handle create error and call toast.error', async () => {
      const spy = vi.spyOn(toastService, 'error');

      const createPromise = service.create({
        projectId: 'p1',
        description: 'Fail',
        duration: 0,
        billable: false,
        startTime: new Date().toISOString(),
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/time-entries`);
      req.flush({ message: 'Validation failed' }, { status: 400, statusText: 'Bad Request' });

      const result = await createPromise;
      expect(result).toBeNull();
      expect(spy).toHaveBeenCalledWith('Validation failed');
    });
  });

  describe('delete', () => {
    it('should DELETE an entry, remove from signal list, and toast success', async () => {
      const successSpy = vi.spyOn(toastService, 'success');
      (service as any).entries.set(mockEntries);

      const deletePromise = service.delete('1');

      const req = httpMock.expectOne(`${environment.apiUrl}/time-entries/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      const result = await deletePromise;
      expect(result).toBe(true);
      expect(service.entries().find((e) => e.id === '1')).toBeUndefined();
      expect(successSpy).toHaveBeenCalledWith('Time entry deleted');
    });

    it('should handle delete error and toast error', async () => {
      const errorSpy = vi.spyOn(toastService, 'error');
      (service as any).entries.set(mockEntries);

      const deletePromise = service.delete('1');

      const req = httpMock.expectOne(`${environment.apiUrl}/time-entries/1`);
      req.flush({}, { status: 500, statusText: 'Server Error' });

      const result = await deletePromise;
      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('Failed to delete time entry');
    });
  });

  describe('getById', () => {
    it('should fetch a single time entry by id', async () => {
      const getPromise = service.getById('1');

      const req = httpMock.expectOne(`${environment.apiUrl}/time-entries/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEntries[0]);

      const result = await getPromise;
      expect(result).toEqual(mockEntries[0]);
    });

    it('should return null on error', async () => {
      const getPromise = service.getById('nonexistent');

      const req = httpMock.expectOne(`${environment.apiUrl}/time-entries/nonexistent`);
      req.flush({}, { status: 404, statusText: 'Not Found' });

      const result = await getPromise;
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should PUT updated data and update signal list', async () => {
      const successSpy = vi.spyOn(toastService, 'success');
      (service as any).entries.set(mockEntries);
      const updateData = { description: 'Updated description' };
      const updatedEntry = { ...mockEntries[0], ...updateData };

      const updatePromise = service.update('1', updateData);

      const req = httpMock.expectOne(`${environment.apiUrl}/time-entries/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(updatedEntry);

      const result = await updatePromise;
      expect(result).toEqual(updatedEntry);
      expect(service.entries()[0].description).toBe('Updated description');
      expect(successSpy).toHaveBeenCalledWith('Time entry updated');
    });

    it('should handle update error and toast error', async () => {
      const errorSpy = vi.spyOn(toastService, 'error');
      (service as any).entries.set(mockEntries);

      const updatePromise = service.update('1', { description: 'Fail' });

      const req = httpMock.expectOne(`${environment.apiUrl}/time-entries/1`);
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });

      const result = await updatePromise;
      expect(result).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith('Not found');
    });
  });

  describe('markAsInvoiced', () => {
    it('should PATCH entries as invoiced and update signal', async () => {
      (service as any).entries.set(mockEntries);

      const markPromise = service.markAsInvoiced(['1', '3'], 'inv-1');

      const req = httpMock.expectOne(`${environment.apiUrl}/time-entries/invoice`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ entryIds: ['1', '3'], invoiceId: 'inv-1' });
      req.flush({});

      const result = await markPromise;
      expect(result).toBe(true);
      for (const entry of service.entries()) {
        if (entry.id === '1' || entry.id === '3') {
          expect(entry.invoiced).toBe(true);
          expect(entry.invoiceId).toBe('inv-1');
        }
      }
    });
  });

  describe('getEntriesForInvoice', () => {
    it('should GET un-invoiced entries filtered by clientId', async () => {
      const fetchPromise = service.getEntriesForInvoice('client-1');

      const req = httpMock.expectOne((r) =>
        r.url === `${environment.apiUrl}/time-entries` && r.method === 'GET'
      );
      expect(req.request.params.get('clientId')).toBe('client-1');
      expect(req.request.params.get('invoiced')).toBe('false');
      req.flush(mockEntries);

      const result = await fetchPromise;
      expect(result).toEqual(mockEntries);
    });

    it('should append projectId params when specified', async () => {
      const fetchPromise = service.getEntriesForInvoice('client-1', ['p1', 'p2']);

      const req = httpMock.expectOne((r) =>
        r.url === `${environment.apiUrl}/time-entries` && r.method === 'GET'
      );
      expect(req.request.params.getAll('projectId')).toEqual(['p1', 'p2']);
      req.flush(mockEntries);

      const result = await fetchPromise;
      expect(result).toEqual(mockEntries);
    });

    it('should return empty array on error', async () => {
      const fetchPromise = service.getEntriesForInvoice('client-1');

      const req = httpMock.expectOne(`${environment.apiUrl}/time-entries?clientId=client-1&invoiced=false`);
      req.flush({}, { status: 500, statusText: 'Error' });

      const result = await fetchPromise;
      expect(result).toEqual([]);
    });
  });
});
