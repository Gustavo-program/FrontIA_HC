import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'cambio-clave',
    loadComponent: () => import('./pages/cambio-clave/cambio-clave').then(m => m.CambioClave)
  }
];
