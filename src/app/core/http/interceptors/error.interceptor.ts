import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { normalizeProblemDetails } from '../../../shared/utils/resolve-problem-details-message';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (request, next: HttpHandlerFn) =>
  next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      return throwError(() => normalizeProblemDetails(error) ?? error);
    }),
  );
