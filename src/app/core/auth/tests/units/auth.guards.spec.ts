// Verifies the auth guards redirect and allow navigation according to session state and permissions.
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { authGuard, guestGuard, permissionGuard } from '../../guards/auth.guards';
import { AuthStore } from '../../stores/auth.store';

describe('auth guards', () => {
  // Shared router and auth collaborators reused across every guard scenario.
  const routerMock = {
    createUrlTree: vi.fn((commands: string[]) => ({ commands })),
  };
  const authStoreMock = {
    isAuthenticated: vi.fn<() => boolean>(),
    rememberRequestedUrl: vi.fn<(url: string) => void>(),
    hasPermission: vi.fn<(permission: string) => boolean>(),
  };

  // Rebuild the injection context before each assertion with clean mocks.
  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthStore,
          useValue: authStoreMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    });
  });

  it('allows authenticated users through authGuard', () => {
    // Step 1: simulate an already authenticated user.
    authStoreMock.isAuthenticated.mockReturnValue(true);

    // Step 2: execute the guard inside Angular's injection context because the guard uses injected services.
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/tickets' } as never),
    );

    // Step 3: an authenticated user should pass through without redirects or side effects.
    expect(result).toBe(true);
    expect(authStoreMock.rememberRequestedUrl).not.toHaveBeenCalled();
  });

  it('redirects unauthenticated users to login from authGuard', () => {
    // Step 1: simulate a user without an active session.
    authStoreMock.isAuthenticated.mockReturnValue(false);

    // Step 2: execute the guard for a protected URL.
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/tickets' } as never),
    );

    // Step 3: the guard should remember the blocked URL so the app can return there after login.
    expect(authStoreMock.rememberRequestedUrl).toHaveBeenCalledWith('/tickets');
    // Step 4: the router should receive a redirect request to the login screen.
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
    // Step 5: the returned UrlTree is the actual signal Angular uses to navigate away.
    expect(result).toEqual({ commands: ['/login'] });
  });

  it('redirects authenticated users away from guestGuard', () => {
    authStoreMock.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    expect(result).toEqual({ commands: ['/dashboard'] });
  });

  it('blocks routes without permission in permissionGuard', () => {
    // Step 1: force the permission lookup to deny access.
    authStoreMock.hasPermission.mockReturnValue(false);

    // Step 2: execute the permission guard with a route that requires USER_READ.
    const result = TestBed.runInInjectionContext(() =>
      permissionGuard(
        {
          data: {
            permission: 'USER_READ',
          },
        } as never,
        {} as never,
      ),
    );

    // Step 3: when the permission is missing, the guard must redirect to the forbidden page.
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/forbidden']);
    expect(result).toEqual({ commands: ['/forbidden'] });
  });

  it('allows routes when at least one required permission is present in permissionGuard', () => {
    authStoreMock.hasPermission.mockImplementation(
      (permission) => permission === 'CATEGORY_UPDATE',
    );

    const result = TestBed.runInInjectionContext(() =>
      permissionGuard(
        {
          data: {
            permissions: ['CATEGORY_CREATE', 'CATEGORY_UPDATE', 'CATEGORY_DISABLE'],
          },
        } as never,
        {} as never,
      ),
    );

    expect(result).toBe(true);
  });
});
