// Covers the users administration page by checking which controls appear for each permission set.
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AuthStore } from '../../../../core/auth/stores/auth.store';
import { UserRecord } from '../../../../shared/models/api.models';
import { UsersPageComponent } from '../../pages/users-page/users-page.component';
import { UsersPageStore } from '../../stores/users-page.store';

describe('UsersPageComponent', () => {
  // Representative user row rendered by the table and reused across permission scenarios.
  const users: UserRecord[] = [
    {
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Admin',
      email: 'ada@example.com',
      role: 'ADMIN',
      active: true,
      lastLoginAt: null,
      version: 1,
    },
  ];

  // PrimeNG table internals expect ResizeObserver, so the browser API is stubbed for tests.
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

  // Creates the page with a mocked store and permission checks tailored to the current test.
  async function setup(allowedPermissions: string[]) {
    // Step 1: create a fake page store with signals and spies so the component can render without real HTTP calls.
    const storeMock = {
      errorMessage: signal<string | null>(null),
      loading: signal(false),
      saving: signal(false),
      users: signal(users),
      saveCompleted: signal(0),
      load: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      toggleStatus: vi.fn(),
    };
    // Step 2: emulate the permission system by answering true only for the permissions passed by each test.
    const authStoreMock = {
      hasPermission: vi.fn((permission: string) => allowedPermissions.includes(permission)),
    };

    // Step 3: compile the real standalone page component while replacing its dependencies with our test doubles.
    await TestBed.configureTestingModule({
      imports: [UsersPageComponent],
      providers: [
        {
          provide: AuthStore,
          useValue: authStoreMock,
        },
      ],
    })
      .overrideComponent(UsersPageComponent, {
        set: {
          providers: [
            {
              provide: UsersPageStore,
              useValue: storeMock,
            },
          ],
        },
      })
      .compileComponents();

    // Step 4: create the component instance and trigger the first rendering cycle.
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    // Step 5: wait one microtask because some bindings and effects complete asynchronously after detectChanges.
    await Promise.resolve();

    // Step 6: return both the fixture and the mocked store so each test can assert DOM and side effects.
    return { fixture, storeMock };
  }

  it('renders users in read-only mode when the role only has USER_READ', async () => {
    // Step 1: build the page as if the logged user only had read permissions.
    const { fixture, storeMock } = await setup(['USER_READ']);

    // Step 2: the page should still load the data because reading users is allowed.
    expect(storeMock.load).toHaveBeenCalledTimes(1);
    // Step 3: write actions must disappear from the UI because this role cannot mutate data.
    expect(fixture.nativeElement.textContent).not.toContain('Nuevo usuario');
    expect(fixture.nativeElement.textContent).not.toContain('Crear usuario');
    expect(fixture.nativeElement.textContent).not.toContain('Editar');
    expect(fixture.nativeElement.textContent).not.toContain('Desactivar');
    // Step 4: the creation/edit form must not be mounted at all in read-only mode.
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  }, 15000);

  it('renders create and write actions when the role has administration permissions', async () => {
    // Step 1: build the page with the complete set of permissions needed to create, edit, and disable users.
    const { fixture } = await setup(['USER_READ', 'USER_CREATE', 'USER_UPDATE', 'USER_DISABLE']);

    // Step 2: now the writable actions should be visible because the user is authorized to manage accounts.
    expect(fixture.nativeElement.textContent).toContain('Nuevo usuario');
    expect(fixture.nativeElement.textContent).toContain('Crear usuario');
    expect(fixture.nativeElement.textContent).toContain('Editar');
    expect(fixture.nativeElement.textContent).toContain('Desactivar');
    // Step 3: the presence of the form confirms the component switched from read-only mode to editable mode.
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
  }, 15000);
});
