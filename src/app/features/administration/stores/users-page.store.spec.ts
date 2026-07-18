import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserRecord,
} from '../../../shared/models/api.models';
import { UsersAdminApiService } from '../services/users-admin-api.service';
import { UsersPageStore } from './users-page.store';

describe('UsersPageStore', () => {
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

  let usersAdminApiServiceMock: {
    listUsers: ReturnType<typeof vi.fn>;
    createUser: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
    updateUserStatus: ReturnType<typeof vi.fn>;
  };
  let usersPageStore: UsersPageStore;

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
    const payload: CreateUserRequest = {
      firstName: 'Linus',
      lastName: 'Manager',
      email: 'linus@example.com',
      password: 'SecurePass!234',
      role: 'SUPPORT_MANAGER',
    };

    usersPageStore.create(payload);

    expect(usersAdminApiServiceMock.createUser).toHaveBeenCalledWith(payload);
    expect(usersAdminApiServiceMock.listUsers).toHaveBeenCalledTimes(1);
    expect(usersPageStore.users()).toEqual(users);
    expect(usersPageStore.saving()).toBe(false);
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
    const payload: UpdateUserRequest = {
      version: 1,
      firstName: 'Ada',
      lastName: 'Admin',
      email: 'ada@example.com',
      role: 'ADMIN',
    };

    usersAdminApiServiceMock.updateUser.mockReturnValueOnce(
      throwError(() => ({
        error: {
          detail: 'Unable to update the selected user.',
        },
      })),
    );

    usersPageStore.update('user-1', payload);

    expect(usersPageStore.errorMessage()).toBe('Unable to update the selected user.');
    expect(usersPageStore.saving()).toBe(false);
    expect(usersPageStore.saveCompleted()).toBe(0);
  });
});
