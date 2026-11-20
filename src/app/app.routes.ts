import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { cambioClaveGuard } from './core/guards/cambio-clave.guard';

export const routes: Routes = [
  // Redirección inicial automática a /login al entrar a localhost:4200
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },

  // Rutas de autenticación (Auth Layout)
  {
    path: '',
    loadComponent: () => import('./core/layouts/auth-layout/auth-layout').then(m => m.AuthLayout),
    children: [
      {
        path: 'login',
        canActivate: [loginGuard],
        loadComponent: () => import('./features/auth/pages/login/login').then(m => m.Login)
      },
      {
        path: 'cambio-clave',
        loadComponent: () => import('./features/auth/pages/cambio-clave/cambio-clave').then(m => m.CambioClave)
      }
    ]
  },

  // Rutas principales del sistema (Main Layout con Sidenav y Toolbar)
  {
    path: '',
    loadComponent: () => import('./core/layouts/main-layout/main-layout').then(m => m.MainLayout),
    canActivate: [authGuard, cambioClaveGuard],
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },
      {
        path: 'inicio',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'digitalizacion',
        canActivate: [roleGuard('ADMIN', 'DIGITALIZADOR')],
        loadChildren: () => import('./features/digitalizacion/digitalizacion.routes').then(m => m.DIGITALIZACION_ROUTES)
      },
      {
        path: 'validacion',
        canActivate: [roleGuard('ADMIN', 'DIGITALIZADOR')],
        loadChildren: () => import('./features/validacion/validacion.routes').then(m => m.VALIDACION_ROUTES)
      },
      {
        path: 'atencion',
        canActivate: [roleGuard('ADMIN', 'DOCTOR')],
        loadChildren: () => import('./features/atencion/atencion.routes').then(m => m.ATENCION_ROUTES)
      },
      {
        path: 'historias',
        canActivate: [roleGuard('ADMIN', 'DOCTOR', 'ADMISION', 'DIGITALIZADOR')],
        loadChildren: () => import('./features/historias-clinicas/historias.routes').then(m => m.HISTORIAS_ROUTES)
      },
      {
        path: 'reportes',
        canActivate: [roleGuard('ADMIN', 'DOCTOR')],
        loadChildren: () => import('./features/reportes/reportes.routes').then(m => m.REPORTES_ROUTES)
      },
      {
        path: 'admision',
        canActivate: [roleGuard('ADMIN', 'ADMISION')],
        loadChildren: () => import('./features/admision/admision.routes').then(m => m.ADMISION_ROUTES)
      },
      {
        path: 'horarios',
        canActivate: [roleGuard('ADMIN', 'RRHH')],
        loadChildren: () => import('./features/horarios/horarios.routes').then(m => m.HORARIOS_ROUTES)
      },
      {
        path: 'administracion',
        canActivate: [roleGuard('ADMIN')],
        loadChildren: () => import('./features/administracion/administracion.routes').then(m => m.ADMINISTRACION_ROUTES)
      },
      {
        path: 'auditoria',
        canActivate: [roleGuard('ADMIN')],
        loadChildren: () => import('./features/auditoria/auditoria.routes').then(m => m.AUDITORIA_ROUTES)
      },
      {
        path: 'acceso-denegado',
        loadComponent: () => import('./core/layouts/acceso-denegado/acceso-denegado').then(m => m.AccesoDenegado)
      }
    ]
  },

  // Ruta 404
  {
    path: '**',
    loadComponent: () => import('./core/layouts/not-found/not-found').then(m => m.NotFound)
  }
];
