// Exercises the users store list and mutation flows, including status toggles and error reporting.
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserRecord,
} from '../../../../shared/models/api.models';
import { UsersAdminApiService } from '../../services/users-admin-api.service';
import { UsersPageStore } from '../../stores/users-page.store';

describe('UsersPageStore', () => {
  // User fixtures reused to verify read, create, update, and activation behaviors.
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
    {
      id: 'user-2',
      firstName: 'Grace',
      lastName: 'Agent',
      email: 'grace@example.com',
      role: 'SUPPORT_AGENT',
      active: false,
      lastLoginAt: null,
      version: 3,
    },
  ];

  // Service spy references and store instance shared by the suite.
  let usersAdminApiServiceMock: {
    listUsers: ReturnType<typeof vi.fn>;
    createUser: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
    updateUserStatus: ReturnType<typeof vi.fn>;
  };
  let usersPageStore: UsersPageStore;

  // Recreates the store and isolated API spies before each test.
  beforeEach(() => {
    usersAdminApiServiceMock = {
      listUsers: vi.fn(() => of(users)),
      createUser: vi.fn(() => of(users[0])),
      updateUser: vi.fn(() => of(users[0])),
      updateUserStatus: vi.fn(() => of(users[0])),
    };

    TestBed.configureTestingModule({
      providers: [
        UsersPageStore,
        {
          provide: UsersAdminApiService,
          useValue: usersAdminApiServiceMock,
        },
      ],
    });

    usersPageStore = TestBed.inject(UsersPageStore);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads the users list', () => {
    usersPageStore.load();

    expect(usersAdminApiServiceMock.listUsers).toHaveBeenCalledTimes(1);
    expect(usersPageStore.users()).toEqual(users);
    expect(usersPageStore.loading()).toBe(false);
    expect(usersPageStore.errorMessage()).toBeNull();
  });

  it('refreshes the list after creating a user and increments the completion counter', () => {
    // Step 1: create the same payload that would come from the user creation form.
    const payload: CreateUserRequest = {
      firstName: 'Linus',
      lastName: 'Manager',
      email: 'linus@example.com',
      password: 'SecurePass!234',
      role: 'SUPPORT_MANAGER',
    };

    // Step 2: execute the creation flow. The expected behavior is create first, then reload the list.
    usersPageStore.create(payload);

    // Step 3: confirm the API received the original user data without transformations.
    expect(usersAdminApiServiceMock.createUser).toHaveBeenCalledWith(payload);
    // Step 4: confirm the list was refreshed after the mutation so the screen reflects the latest backend state.
    expect(usersAdminApiServiceMock.listUsers).toHaveBeenCalledTimes(1);
    // Step 5: confirm the reloaded dataset was exposed through the store state.
    expect(usersPageStore.users()).toEqual(users);
    // Step 6: saving must finish after the request chain completes.
    expect(usersPageStore.saving()).toBe(false);
    // Step 7: the success counter must increment so the component can react to the completed mutation.
    expect(usersPageStore.saveCompleted()).toBe(1);
  });

  it('sends the inverted active flag when toggling a user status', () => {
    usersPageStore.toggleStatus(users[1]);

    expect(usersAdminApiServiceMock.updateUserStatus).toHaveBeenCalledWith('user-2', {
      version: 3,
      active: true,
    });
    expect(usersAdminApiServiceMock.listUsers).toHaveBeenCalledTimes(1);
    expect(usersPageStore.users()).toEqual(users);
  });

  it('stores an actionable error when updating a user fails', () => {
    // Step 1: prepare the update payload for an existing user.
    const payload: UpdateUserRequest = {
      version: 1,
      firstName: 'Ada',
      lastName: 'Admin',
      email: 'ada@example.com',
      role: 'ADMIN',
    };

    // Step 2: force the update API to fail so the store enters its error-handling branch.
    usersAdminApiServiceMock.updateUser.mockReturnValueOnce(
      throwError(() => ({
        error: {
          detail: 'Unable to update the selected user.',
        },
      })),
    );

    // Step 3: execute the update operation with the failing backend behavior.
    usersPageStore.update('user-1', payload);

    // Step 4: the store should expose a clear message for the component to render to the final user.
    expect(usersPageStore.errorMessage()).toBe('Unable to update the selected user.');
    // Step 5: even in failure, transient saving state must be released.
    expect(usersPageStore.saving()).toBe(false);
    // Step 6: the success counter must stay unchanged because nothing was actually persisted.
    expect(usersPageStore.saveCompleted()).toBe(0);
  });
});
