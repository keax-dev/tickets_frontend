// Validates how the auth interceptor decorates requests and recovers from expired sessions.
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { authInterceptor } from '../../interceptors/auth.interceptor';
import { AuthStore } from '../../../auth/stores/auth.store';

describe('authInterceptor', () => {
  // Mocked collaborators for token access, refresh retries, and navigation side effects.
  const authStoreMock = {
    accessToken: vi.fn<() => string | null>(),
    refreshSession: vi.fn(),
    rememberRequestedUrl: vi.fn(),
  };
  const routerMock = {
    url: '/tickets',
    navigateByUrl: vi.fn(),
  };

  // HTTP harness reused to inspect outgoing requests and replay responses.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  // Rebuild the interceptor pipeline with isolated mocks on each test case.
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
    // Step 1: expose a fake access token as if the user already had a valid authenticated session.
    authStoreMock.accessToken.mockReturnValue('token-123');

    // Step 2: perform any protected request. The interceptor should enrich it before it leaves the client.
    httpClient.get('/api/tickets').subscribe();

    // Step 3: capture the outgoing request from the HTTP testing controller.
    const request = httpTestingController.expectOne('/api/tickets');

    // Step 4: verify that the interceptor added the Authorization header with the expected Bearer format.
    expect(request.request.headers.get('Authorization')).toBe('Bearer token-123');
    // Step 5: verify credentials are still sent because the backend also relies on cookies/session refresh.
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
    // Step 1: simulate an expired token on the first attempt.
    authStoreMock.accessToken.mockReturnValue('expired-token');
    // Step 2: simulate a successful refresh flow that returns a new access token.
    authStoreMock.refreshSession.mockReturnValue(of('refreshed-token'));

    // Step 3: trigger a protected request that will initially fail with 401.
    httpClient.get('/api/tickets').subscribe();

    // Step 4: capture the original request and respond with 401 to force the retry logic.
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

    // Step 5: after refresh succeeds, the interceptor should transparently reissue the same request.
    const retriedRequest = httpTestingController.expectOne('/api/tickets');

    // Step 6: the retried request must carry the new token and a retry marker to avoid infinite loops.
    expect(retriedRequest.request.headers.get('Authorization')).toBe('Bearer refreshed-token');
    expect(retriedRequest.request.headers.get('X-Retry-Auth')).toBe('1');

    // Step 7: complete the retried call so the HTTP test queue closes cleanly.
    retriedRequest.flush([]);
  });

  it('redirects to login when the refresh token flow cannot recover the session', () => {
    // Step 1: keep a local variable to capture the final propagated error from the observable chain.
    let receivedError: unknown;

    // Step 2: simulate an expired access token and a refresh flow that cannot recover the session.
    authStoreMock.accessToken.mockReturnValue('expired-token');
    authStoreMock.refreshSession.mockReturnValue(of(null));

    // Step 3: execute the protected request and subscribe to its error branch.
    httpClient.get('/api/tickets').subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    // Step 4: fail the initial request with 401 to trigger the refresh branch.
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

    // Step 5: because refresh returned null, the interceptor must remember the current route and send the user to login.
    expect(authStoreMock.rememberRequestedUrl).toHaveBeenCalledWith('/tickets');
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
    // Step 6: the original subscriber should still receive an error so the calling code can react if needed.
    expect(receivedError).toBeTruthy();
  });
});
