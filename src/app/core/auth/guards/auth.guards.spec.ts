import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { authGuard, guestGuard, permissionGuard } from './auth.guards';
import { AuthStore } from '../stores/auth.store';

describe('auth guards', () => {
  const routerMock = {
    createUrlTree: vi.fn((commands: string[]) => ({ commands })),
  };
  const authStoreMock = {
    isAuthenticated: vi.fn<() => boolean>(),
    rememberRequestedUrl: vi.fn<(url: string) => void>(),
    hasPermission: vi.fn<(permission: string) => boolean>(),
  };

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
    authStoreMock.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/tickets' } as never),
    );

    expect(result).toBe(true);
    expect(authStoreMock.rememberRequestedUrl).not.toHaveBeenCalled();
  });

  it('redirects unauthenticated users to login from authGuard', () => {
    authStoreMock.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/tickets' } as never),
    );

    expect(authStoreMock.rememberRequestedUrl).toHaveBeenCalledWith('/tickets');
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toEqual({ commands: ['/login'] });
  });

  it('redirects authenticated users away from guestGuard', () => {
    authStoreMock.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    expect(result).toEqual({ commands: ['/dashboard'] });
  });

  it('blocks routes without permission in permissionGuard', () => {
    authStoreMock.hasPermission.mockReturnValue(false);

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
