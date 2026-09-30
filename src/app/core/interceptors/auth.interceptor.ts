import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const authorization = auth.getAuthorizationHeader();
  const runtimeConfig = (window as typeof window & {
    __APP_CONFIG__?: { apiBaseUrl?: string };
  }).__APP_CONFIG__;
  const baseUrl = (runtimeConfig?.apiBaseUrl || '').replace(/\/$/, '');
  const apiRequest =
    baseUrl && request.url.startsWith('/api')
      ? request.clone({ url: `${baseUrl}${request.url}` })
      : request;
  const securedRequest = authorization
    ? apiRequest.clone({ setHeaders: { Authorization: authorization } })
    : apiRequest;

  return next(securedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !request.url.endsWith('/api/auth/token')) {
        auth.logout();
        void router.navigate(['/login'], { queryParams: { sessionExpired: true } });
      }
      return throwError(() => error);
    }),
  );
};
