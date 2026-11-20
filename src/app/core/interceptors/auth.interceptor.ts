import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../auth/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/auth/login')) {
    return next(req);
  }
  const tokenStorage = inject(TokenStorageService);
  const token = tokenStorage.getToken();

  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }
  return next(req);
};
