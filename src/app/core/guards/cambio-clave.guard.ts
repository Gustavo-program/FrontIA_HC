import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../auth/auth.store';

export const cambioClaveGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);

  if (store.debeCambiarClave()) {
    return router.createUrlTree(['/cambio-clave']);
  }
  return true;
};
