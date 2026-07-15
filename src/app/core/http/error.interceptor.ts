import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (request, next: HttpHandlerFn) =>
  next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    }),
  );
