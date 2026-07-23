// Exercises the SLA page UI under different permission sets and verifies update submissions.
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AuthStore } from '../../../../core/auth/stores/auth.store';
import { SlaPolicy } from '../../../../shared/models/api.models';
import { SlaPageComponent } from '../../pages/sla-page/sla-page.component';
import { SlaPageStore } from '../../stores/sla-page.store';

describe('SlaPageComponent', () => {
  // Minimal SLA fixture rendered by the page in both read-only and editable states.
  const policies: SlaPolicy[] = [
    {
      id: 'sla-high',
      priority: 'HIGH',
      firstResponseHours: 2,
      resolutionHours: 8,
      active: true,
      version: 3,
    },
  ];

  // PrimeNG components rely on ResizeObserver in the browser, so the tests stub it once.
  beforeAll(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  // Builds the page with mocked store state and a permission-aware auth facade.
  async function setup(allowedPermissions: string[]) {
    const storeMock = {
      errorMessage: signal<string | null>(null),
      loading: signal(false),
      saving: signal(false),
      policies: signal(policies),
      load: vi.fn(),
      update: vi.fn(),
    };
    const authStoreMock = {
      hasPermission: vi.fn((permission: string) => allowedPermissions.includes(permission)),
    };

    await TestBed.configureTestingModule({
      imports: [SlaPageComponent],
      providers: [
        {
          provide: AuthStore,
          useValue: authStoreMock,
        },
      ],
    })
      .overrideComponent(SlaPageComponent, {
        set: {
          providers: [
            {
              provide: SlaPageStore,
              useValue: storeMock,
            },
          ],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(SlaPageComponent);
    fixture.detectChanges();
    await Promise.resolve();

    return { fixture, storeMock };
  }

  it('renders SLA in read-only mode without SLA_UPDATE', async () => {
    const { fixture, storeMock } = await setup(['SLA_READ']);

    expect(storeMock.load).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.textContent).not.toContain('Guardar SLA');
    expect(fixture.nativeElement.textContent).not.toContain('Editar');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('submits policy updates when the role has SLA_UPDATE', async () => {
    const { fixture, storeMock } = await setup(['SLA_READ', 'SLA_UPDATE']);
    const component = fixture.componentInstance;

    component.slaForm.setValue({
      priority: 'HIGH',
      firstResponseHours: 1,
      resolutionHours: 6,
      active: true,
    });

    component.submit();

    expect(storeMock.update).toHaveBeenCalledWith('HIGH', {
      version: 3,
      firstResponseHours: 1,
      resolutionHours: 6,
      active: true,
    });
    expect(fixture.nativeElement.textContent).toContain('Guardar SLA');
  });
});
