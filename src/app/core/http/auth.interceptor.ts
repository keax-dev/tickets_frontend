import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthStore } from '../auth/auth.store';

function isAuthenticationRequest(request: HttpRequest<unknown>): boolean {
  return request.url.includes('/auth/login') || request.url.includes('/auth/refresh');
}

export const authInterceptor: HttpInterceptorFn = (request, next: HttpHandlerFn) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const accessToken = authStore.accessToken();

  const authenticatedRequest =
    accessToken && !isAuthenticationRequest(request)
      ? request.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        })
      : request.clone({
          withCredentials: true,
        });

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status !== 401 ||
        isAuthenticationRequest(request) ||
        request.headers.has('X-Retry-Auth')
      ) {
        return throwError(() => error);
      }

      return authStore.refreshSession().pipe(
        switchMap((token) => {
          if (!token) {
            authStore.rememberRequestedUrl(router.url);
            void router.navigateByUrl('/login');
            return throwError(() => error);
          }

          return next(
            request.clone({
              withCredentials: true,
              setHeaders: {
                Authorization: `Bearer ${token}`,
                'X-Retry-Auth': '1',
              },
            }),
          );
        }),
      );
    }),
  );
};
