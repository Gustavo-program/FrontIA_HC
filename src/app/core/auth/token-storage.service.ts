import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.token = sessionStorage.getItem('hc_token');
    this.refreshToken = sessionStorage.getItem('hc_refresh');
  }

  getToken(): string | null {
    return this.token;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  setTokens(token: string, refreshToken: string): void {
    this.token = token;
    this.refreshToken = refreshToken;
    sessionStorage.setItem('hc_token', token);
    sessionStorage.setItem('hc_refresh', refreshToken);
  }

  clear(): void {
    this.token = null;
    this.refreshToken = null;
    sessionStorage.removeItem('hc_token');
    sessionStorage.removeItem('hc_refresh');
    sessionStorage.removeItem('hc_user');
  }

  hasToken(): boolean {
    return !!this.token;
  }
}
