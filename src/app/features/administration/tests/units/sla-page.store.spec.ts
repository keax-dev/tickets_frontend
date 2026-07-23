// Validates the SLA store list and update flows, including actionable error propagation.
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { SlaPolicy, UpdateSlaPolicyRequest } from '../../../../shared/models/api.models';
import { SlaAdminApiService } from '../../services/sla-admin-api.service';
import { SlaPageStore } from '../../stores/sla-page.store';

describe('SlaPageStore', () => {
  // Policy fixtures that emulate the backend catalog returned to the admin page.
  const policies: SlaPolicy[] = [
    {
      id: 'sla-low',
      priority: 'LOW',
      firstResponseHours: 8,
      resolutionHours: 48,
      active: true,
      version: 1,
    },
    {
      id: 'sla-high',
      priority: 'HIGH',
      firstResponseHours: 2,
      resolutionHours: 8,
      active: true,
      version: 3,
    },
  ];

  // Service spy references and store instance used by all test cases.
  let slaAdminApiServiceMock: {
    listSlaPolicies: ReturnType<typeof vi.fn>;
    updateSlaPolicy: ReturnType<typeof vi.fn>;
  };
  let slaPageStore: SlaPageStore;

  // Recreates the store with clean API spies before each scenario.
  beforeEach(() => {
    slaAdminApiServiceMock = {
      listSlaPolicies: vi.fn(() => of(policies)),
      updateSlaPolicy: vi.fn(() => of(policies[1])),
    };

    TestBed.configureTestingModule({
      providers: [
        SlaPageStore,
        {
          provide: SlaAdminApiService,
          useValue: slaAdminApiServiceMock,
        },
      ],
    });

    slaPageStore = TestBed.inject(SlaPageStore);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads the sla policies', () => {
    slaPageStore.load();

    expect(slaAdminApiServiceMock.listSlaPolicies).toHaveBeenCalledTimes(1);
    expect(slaPageStore.policies()).toEqual(policies);
    expect(slaPageStore.loading()).toBe(false);
    expect(slaPageStore.errorMessage()).toBeNull();
  });

  it('refreshes the policies after an update', () => {
    const payload: UpdateSlaPolicyRequest = {
      version: 3,
      firstResponseHours: 1,
      resolutionHours: 6,
      active: true,
    };

    slaPageStore.update('HIGH', payload);

    expect(slaAdminApiServiceMock.updateSlaPolicy).toHaveBeenCalledWith('HIGH', payload);
    expect(slaAdminApiServiceMock.listSlaPolicies).toHaveBeenCalledTimes(1);
    expect(slaPageStore.policies()).toEqual(policies);
    expect(slaPageStore.saving()).toBe(false);
  });

  it('stores an actionable error when updating a policy fails', () => {
    slaAdminApiServiceMock.updateSlaPolicy.mockReturnValueOnce(
      throwError(() => ({
        error: {
          detail: 'Unable to update the selected SLA policy.',
        },
      })),
    );

    slaPageStore.update('HIGH', {
      version: 3,
      firstResponseHours: 1,
      resolutionHours: 6,
      active: true,
    });

    expect(slaPageStore.errorMessage()).toBe('Unable to update the selected SLA policy.');
    expect(slaPageStore.saving()).toBe(false);
  });
});
