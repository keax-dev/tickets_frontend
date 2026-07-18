import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
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

  it('retries the original request after a successful refresh', () => {
    authStoreMock.accessToken.mockReturnValue('expired-token');
    authStoreMock.refreshSession.mockReturnValue(of('refreshed-token'));

    httpClient.get('/api/tickets').subscribe();

    const initialRequest = httpTestingController.expectOne('/api/tickets');

    initialRequest.flush(
      {
        detail: 'Session expired.',
      },
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );

    const retriedRequest = httpTestingController.expectOne('/api/tickets');

    expect(retriedRequest.request.headers.get('Authorization')).toBe('Bearer refreshed-token');
    expect(retriedRequest.request.headers.get('X-Retry-Auth')).toBe('1');

    retriedRequest.flush([]);
  });

  it('redirects to login when the refresh token flow cannot recover the session', () => {
    let receivedError: unknown;

    authStoreMock.accessToken.mockReturnValue('expired-token');
    authStoreMock.refreshSession.mockReturnValue(of(null));

    httpClient.get('/api/tickets').subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    const initialRequest = httpTestingController.expectOne('/api/tickets');

    initialRequest.flush(
      {
        detail: 'Session expired.',
      },
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );

    expect(authStoreMock.rememberRequestedUrl).toHaveBeenCalledWith('/tickets');
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
    expect(receivedError).toBeTruthy();
  });
});
