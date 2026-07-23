import { Injectable, computed, inject, signal } from '@angular/core';
import { resolveProblemDetailsMessage } from '../../../shared/utils/resolve-problem-details-message';
import { API_BASE_URL } from '../../config/tokens/api-base-url.token';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  ProblemDetails,
  AppPermission,
  AuthResponse,
  CurrentUser,
} from '../../../shared/models/api.models';
import {
  firstValueFrom,
  shareReplay,
  Observable,
  catchError,
  finalize,
  mapTo,
  map,
  tap,
  of,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly defaultRequestedUrl = '/dashboard';
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly requestedUrlState = signal(this.defaultRequestedUrl);
  private readonly accessTokenState = signal<string | null>(null);
  private readonly refreshingState = signal(false);
  private readonly restoringState = signal(true);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly userState = signal<CurrentUser | null>(null);

  private refreshInFlight$?: Observable<string | null>;

  readonly errorMessage = this.errorState.asReadonly();
  readonly accessToken = this.accessTokenState.asReadonly();
  readonly currentUser = this.userState.asReadonly();
  readonly refreshing = this.refreshingState.asReadonly();
  readonly restoring = this.restoringState.asReadonly();
  readonly loading = this.loadingState.asReadonly();

  readonly isAuthenticated = computed(
    () => this.userState() !== null && this.accessTokenState() !== null,
  );
  readonly userInitials = computed(() => {
    const currentUser = this.userState();
    if (!currentUser) {
      return 'MT';
    }

    return `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase();
  });

  restoreSession(): Promise<void> {
    return firstValueFrom(
      this.createRefreshRequest().pipe(
        mapTo(void 0),
        finalize(() => this.restoringState.set(false)),
      ),
    );
  }

  login(credentials: { email: string; password: string }): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.httpClient
      .post<AuthResponse>(`${this.apiBaseUrl}/auth/login`, credentials, {
        withCredentials: true,
      })
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (response) => {
          const requestedUrl = this.requestedUrlState();

          this.applyAuthResponse(response);
          this.requestedUrlState.set(this.defaultRequestedUrl);
          void this.router.navigateByUrl(requestedUrl);
        },
        error: (error: ProblemDetails) => {
          this.errorState.set(resolveProblemDetailsMessage(error, 'No se pudo iniciar sesión.'));
        },
      });
  }

  logout(): void {
    this.httpClient
      .post<void>(`${this.apiBaseUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        catchError(() => of(void 0)),
        tap(() => this.clearSession()),
      )
      .subscribe(() => {
        void this.router.navigateByUrl('/login');
      });
  }

  rememberRequestedUrl(url: string): void {
    this.requestedUrlState.set(url);
  }

  hasPermission(permission: AppPermission): boolean {
    return this.userState()?.permissions.includes(permission) ?? false;
  }

  refreshSession(): Observable<string | null> {
    if (!this.refreshInFlight$) {
      this.refreshInFlight$ = this.createRefreshRequest().pipe(
        map((response) => response?.accessToken ?? null),
        finalize(() => {
          this.refreshInFlight$ = undefined;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }

    return this.refreshInFlight$;
  }

  private createRefreshRequest() {
    this.refreshingState.set(true);

    return this.httpClient
      .post<AuthResponse>(`${this.apiBaseUrl}/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((response) => {
          this.errorState.set(null);
          this.applyAuthResponse(response);
        }),
        catchError(() => {
          this.clearSession();
          return of(null);
        }),
        finalize(() => {
          this.refreshingState.set(false);
        }),
      );
  }

  private applyAuthResponse(response: AuthResponse): void {
    this.accessTokenState.set(response.accessToken);
    this.userState.set(response.user);
  }

  private clearSession(): void {
    this.requestedUrlState.set(this.defaultRequestedUrl);
    this.accessTokenState.set(null);
    this.userState.set(null);
  }
}
