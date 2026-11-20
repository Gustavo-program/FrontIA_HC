import { HttpInterceptorFn } from '@angular/common/http';

export const correlationIdInterceptor: HttpInterceptorFn = (req, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const correlationId = 'insn-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8);
    const cloned = req.clone({
      setHeaders: { 'X-Correlation-Id': correlationId }
    });
    return next(cloned);
  }
  return next(req);
};
