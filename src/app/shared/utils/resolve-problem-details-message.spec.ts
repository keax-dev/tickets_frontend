import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {
  normalizeProblemDetails,
  resolveProblemDetailsFieldErrors,
  resolveProblemDetailsMessage,
} from './resolve-problem-details-message';

describe('resolveProblemDetailsMessage', () => {
  it('prefers validation field errors over a generic detail', () => {
    const error = {
      detail: 'Validation failed.',
      fieldErrors: [
        { field: 'email', message: 'Email is required.' },
        { field: 'password', message: 'Password must have at least 8 characters.' },
      ],
    };

    expect(resolveProblemDetailsFieldErrors(error)).toEqual(error.fieldErrors);
    expect(resolveProblemDetailsMessage(error, 'Fallback message')).toBe(
      'Email is required. Password must have at least 8 characters.',
    );
  });

  it('normalizes backend problem details from HttpErrorResponse', () => {
    const error = new HttpErrorResponse({
      status: 409,
      statusText: 'Conflict',
      headers: new HttpHeaders({
        'X-Correlation-Id': 'corr-123',
      }),
      error: {
        title: 'Conflict',
        detail: 'The email address is already in use.',
        code: 'USER_ALREADY_EXISTS',
      },
    });

    expect(normalizeProblemDetails(error)).toEqual({
      status: 409,
      title: 'Conflict',
      detail: 'The email address is already in use.',
      code: 'USER_ALREADY_EXISTS',
      correlationId: 'corr-123',
      fieldErrors: [],
    });
  });

  it('returns a friendly message for network failures', () => {
    const error = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error',
      error: new Error('Network failure'),
    });

    expect(resolveProblemDetailsMessage(error, 'Fallback message')).toBe(
      'No se pudo conectar con el servidor. Revisa tu conexión e intenta nuevamente.',
    );
  });
});
