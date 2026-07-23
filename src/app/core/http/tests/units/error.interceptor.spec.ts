// Ensures the error interceptor maps backend and network failures into a consistent problem-details shape.
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorInterceptor } from '../../interceptors/error.interceptor';

describe('errorInterceptor', () => {
  // HTTP utilities used to execute requests and control mocked error responses.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  // Builds the interceptor chain before every test so request state never leaks.
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('normalizes backend problem details and preserves correlation ids', () => {
    // Step 1: keep a local slot to capture the transformed error that reaches the subscriber.
    let receivedError: unknown;

    // Step 2: perform a request and subscribe only to the error channel because this test targets failure mapping.
    httpClient.get('/api/tickets').subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    // Step 3: intercept the outgoing request so the test can simulate the backend response.
    const request = httpTestingController.expectOne('/api/tickets');

    // Step 4: flush a structured backend error payload plus the correlation id header returned by the API.
    request.flush(
      {
        title: 'Forbidden',
        detail: 'You do not have permission to assign this ticket.',
        code: 'ACCESS_DENIED',
      },
      {
        status: 403,
        statusText: 'Forbidden',
        headers: {
          'X-Correlation-Id': 'corr-403',
        },
      },
    );

    // Step 5: verify that the interceptor normalized the error into the frontend problem-details contract.
    expect(receivedError).toEqual({
      status: 403,
      title: 'Forbidden',
      detail: 'You do not have permission to assign this ticket.',
      code: 'ACCESS_DENIED',
      correlationId: 'corr-403',
      fieldErrors: [],
    });
  });

  it('normalizes network failures into problem details', () => {
    // Step 1: keep a local slot to capture the mapped transport error.
    let receivedError: unknown;

    // Step 2: trigger any request and listen to the error channel.
    httpClient.get('/api/tickets').subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    // Step 3: capture the request and emulate a low-level network failure instead of an HTTP status response.
    const request = httpTestingController.expectOne('/api/tickets');

    request.error(new ProgressEvent('error'));

    // Step 4: verify that the interceptor still returns a consistent problem-details object for connectivity issues.
    expect(receivedError).toEqual({
      status: 0,
      title: 'Unknown Error',
      detail: 'No se pudo conectar con el servidor. Revisa tu conexión e intenta nuevamente.',
      code: 'NETWORK_ERROR',
      correlationId: undefined,
      fieldErrors: [],
    });
  });
});
