import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (!req.url.includes('/auth/login')) {
          authService.logout();
          notification.error('Su sesión ha expirado o las credenciales son inválidas.');
        } else {
          notification.error(error.error?.message || 'Usuario o contraseña incorrectos.');
        }
      } else if (error.status === 403) {
        notification.error('No tiene permisos para realizar esta operación.');
      } else if (error.status === 0) {
        notification.error('No se pudo establecer conexión con el servidor.');
      } else if (error.error?.message) {
        notification.error(error.error.message);
      } else if (error.status >= 500) {
        notification.error('Ocurrió un error en el servidor. Por favor intente nuevamente.');
      }
      return throwError(() => error);
    })
  );
};
