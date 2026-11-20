import { Routes } from '@angular/router';

export const ADMINISTRACION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'citas-pendientes',
    pathMatch: 'full'
  },
  {
    path: 'citas-pendientes',
    loadComponent: () => import('./pages/citas-pendientes/citas-pendientes').then(m => m.CitasPendientes)
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./pages/usuarios-gestion/usuarios-gestion').then(m => m.UsuariosGestion)
  },
  {
    path: 'doctores',
    loadComponent: () => import('./pages/doctores-gestion/doctores-gestion').then(m => m.DoctoresGestion)
  },
  {
    path: 'personal',
    loadComponent: () => import('./pages/personal-gestion/personal-gestion').then(m => m.PersonalGestion)
  },
  {
    path: 'catalogos',
    loadComponent: () => import('./pages/catalogos-gestion/catalogos-gestion').then(m => m.CatalogosGestion)
  },
  {
    path: 'parametros',
    loadComponent: () => import('./pages/parametros-gestion/parametros-gestion').then(m => m.ParametrosGestion)
  }
];
