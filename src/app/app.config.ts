import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { correlationIdInterceptor } from './core/interceptors/correlation-id.interceptor';

registerLocaleData(localeEsPe, 'es-PE');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([
        correlationIdInterceptor,
        authInterceptor,
        loadingInterceptor,
        errorInterceptor
      ])
    ),
    provideNoopAnimations(),
    provideNativeDateAdapter(),
    { provide: LOCALE_ID, useValue: 'es-PE' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }
  ]
};
