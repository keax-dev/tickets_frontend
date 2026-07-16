import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { correlationIdInterceptor } from './core/http/interceptors/correlation-id.interceptor';
import { errorInterceptor } from './core/http/interceptors/error.interceptor';
import { authInterceptor } from './core/http/interceptors/auth.interceptor';
import { providePrimeNG } from 'primeng/config';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from './core/config/tokens/api-base-url.token';
import { AuthStore } from './core/auth/stores/auth.store';
import { resolveAppConfig } from './core/config/utils/resolve-app-config';
import { ThemeStore } from './core/theme/stores/theme.store';
import { routes } from './app.routes';
import Aura from '@primeuix/themes/aura';
import { environment } from '../environments/environment';
import {
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  provideAppInitializer,
  ApplicationConfig,
  inject,
} from '@angular/core';

const appRuntimeConfig = resolveAppConfig(environment);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAppInitializer(() => {
      inject(ThemeStore);
    }),
    provideAppInitializer(() => inject(AuthStore).restoreSession()),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([correlationIdInterceptor, authInterceptor, errorInterceptor]),
    ),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    }),
    {
      provide: API_BASE_URL,
      useValue: appRuntimeConfig.apiBaseUrl,
    },
  ],
};
