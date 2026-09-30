import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ApiResponse, LoginRequest, TokenResponse } from '../models/api.models';

const TOKEN_KEY = 'geo_admin_access_token';
const TOKEN_TYPE_KEY = 'geo_admin_token_type';
const EXPIRY_KEY = 'geo_admin_token_expiry';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly token = signal(this.readStoredToken());

  readonly isAuthenticated = computed(() => Boolean(this.token()));

  login(request: LoginRequest) {
    return this.http.post<ApiResponse<TokenResponse>>('/api/auth/token', request).pipe(
      tap((response) => {
        if (!response.success || !response.data?.accessToken) {
          throw new Error(response.errorMessage || 'The username or password is incorrect.');
        }

        const tokenType = response.data.tokenType || 'Bearer';
        localStorage.setItem(TOKEN_KEY, response.data.accessToken);
        localStorage.setItem(TOKEN_TYPE_KEY, tokenType);
        localStorage.setItem(EXPIRY_KEY, response.data.expiresAtUtc);
        this.token.set(response.data.accessToken);
      }),
    );
  }

  getAuthorizationHeader(): string | null {
    const accessToken = this.token();
    if (!accessToken) return null;
    return `${localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer'} ${accessToken}`;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    this.token.set(null);
  }

  private readStoredToken(): string | null {
    const expiry = localStorage.getItem(EXPIRY_KEY);
    if (expiry && new Date(expiry).getTime() <= Date.now()) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_TYPE_KEY);
      localStorage.removeItem(EXPIRY_KEY);
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }
}
