import { provideHttpClient, withFetch } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { LOCALE_ID } from '@angular/core';
import { routes } from './app.routes';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es');

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimations(), provideHttpClient(withFetch()),{ provide: LOCALE_ID, useValue: 'es' }],
}; 
