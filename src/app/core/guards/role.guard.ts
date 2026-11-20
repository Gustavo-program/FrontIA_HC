import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../auth/auth.store';
import { RolCodigo } from '../models/session.model';

export function roleGuard(...roles: RolCodigo[]): CanActivateFn {
  return () => {
    const store = inject(AuthStore);
    const router = inject(Router);

    if (store.tieneAlgunRol(roles)) {
      return true;
    }
    return router.createUrlTree(['/acceso-denegado']);
  };
}
