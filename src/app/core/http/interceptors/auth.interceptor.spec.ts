import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { AuthStore } from '../../auth/stores/auth.store';

describe('authInterceptor', () => {
  const authStoreMock = {
    accessToken: vi.fn<() => string | null>(),
    refreshSession: vi.fn(),
    rememberRequestedUrl: vi.fn(),
  };
  const routerMock = {
    url: '/tickets',
    navigateByUrl: vi.fn(),
  };

  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
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

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('adds the bearer token to authenticated requests', () => {
    authStoreMock.accessToken.mockReturnValue('token-123');

    httpClient.get('/api/tickets').subscribe();

    const request = httpTestingController.expectOne('/api/tickets');

    expect(request.request.headers.get('Authorization')).toBe('Bearer token-123');
    expect(request.request.withCredentials).toBe(true);
  });

  it('does not add Authorization to authentication endpoints', () => {
    authStoreMock.accessToken.mockReturnValue('token-123');

    httpClient.post('/api/v1/auth/login', {}).subscribe();

    const request = httpTestingController.expectOne('/api/v1/auth/login');

    expect(request.request.headers.has('Authorization')).toBe(false);
    expect(request.request.withCredentials).toBe(true);
  });
});
