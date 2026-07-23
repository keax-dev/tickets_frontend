// Covers the auth store login/logout flow, persisted session state, and backend error handling.
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { AuthStore } from '../../stores/auth.store';
import { API_BASE_URL } from '../../../config/tokens/api-base-url.token';
import { AuthResponse, CurrentUser } from '../../../../shared/models/api.models';

describe('AuthStore', () => {
  // Router spy and API fixtures used to emulate a successful authenticated session.
  const routerMock = {
    navigateByUrl: vi.fn(),
  };
  const apiBaseUrl = 'http://localhost:8080/api/v1';
  const currentUser: CurrentUser = {
    id: 'user-1',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    role: 'ADMIN',
    permissions: ['USER_READ'],
  };
  const authResponse: AuthResponse = {
    accessToken: 'token-123',
    expiresAt: '2026-01-01T00:00:00.000Z',
    user: currentUser,
  };

  // Handles injected once the testing module is ready.
  let authStore: AuthStore;
  let httpTestingController: HttpTestingController;

  // Creates a fresh store and HTTP testing harness for every scenario.
  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: API_BASE_URL,
          useValue: apiBaseUrl,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    });

    authStore = TestBed.inject(AuthStore);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('stores the authenticated session after login', () => {
    authStore.login({
      email: 'ada@example.com',
      password: 'SecurePass!234',
    });

    const request = httpTestingController.expectOne(`${apiBaseUrl}/auth/login`);

    expect(request.request.withCredentials).toBe(true);

    request.flush(authResponse);

    expect(authStore.accessToken()).toBe('token-123');
    expect(authStore.currentUser()).toEqual(currentUser);
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('resets the requested url after logout', () => {
    authStore.rememberRequestedUrl('/admin/users');

    authStore.login({
      email: 'ada@example.com',
      password: 'SecurePass!234',
    });

    httpTestingController.expectOne(`${apiBaseUrl}/auth/login`).flush(authResponse);

    expect(routerMock.navigateByUrl).toHaveBeenNthCalledWith(1, '/admin/users');

    authStore.logout();

    httpTestingController.expectOne(`${apiBaseUrl}/auth/logout`).flush({});

    expect(routerMock.navigateByUrl).toHaveBeenNthCalledWith(2, '/login');

    authStore.login({
      email: 'ada@example.com',
      password: 'SecurePass!234',
    });

    httpTestingController.expectOne(`${apiBaseUrl}/auth/login`).flush(authResponse);

    expect(routerMock.navigateByUrl).toHaveBeenNthCalledWith(3, '/dashboard');
  });

  it('surfaces backend login errors', () => {
    authStore.login({
      email: 'ada@example.com',
      password: 'wrong-password',
    });

    const request = httpTestingController.expectOne(`${apiBaseUrl}/auth/login`);

    request.flush(
      {
        detail: 'Credenciales invalidas.',
      },
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );

    expect(authStore.errorMessage()).toBe('Credenciales invalidas.');
    expect(authStore.loading()).toBe(false);
  });
});
