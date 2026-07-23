import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

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
    let receivedError: unknown;

    httpClient.get('/api/tickets').subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    const request = httpTestingController.expectOne('/api/tickets');

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
    let receivedError: unknown;

    httpClient.get('/api/tickets').subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    const request = httpTestingController.expectOne('/api/tickets');

    request.error(new ProgressEvent('error'));

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
