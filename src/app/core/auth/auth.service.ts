import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthStore } from './auth.store';
import { TokenStorageService } from './token-storage.service';
import { LoginRequest, LoginResponse, CambioClaveRequest, UsuarioSesion } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly store = inject(AuthStore);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly apiUrl = environment.apiUrl;
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, request).pipe(
      tap(res => {
        this.tokenStorage.setTokens(res.token, res.refreshToken);
        this.store.setUsuario(res.usuario);
        this.startInactivityTimer();
      })
    );
  }

  logout(): void {
    this.tokenStorage.clear();
    this.store.clear();
    this.stopInactivityTimer();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(res => {
        this.tokenStorage.setTokens(res.token, res.refreshToken);
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  getProfile(): Observable<UsuarioSesion> {
    return this.http.get<UsuarioSesion>(`${this.apiUrl}/auth/me`).pipe(
      tap(u => this.store.setUsuario(u))
    );
  }

  cambiarClave(request: CambioClaveRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/cambiar-clave`, request).pipe(
      tap(() => {
        this.store.actualizarDebeCambiarClave(false);
      })
    );
  }

  private startInactivityTimer(): void {
    this.stopInactivityTimer();
    const timeoutMs = environment.sessionTimeoutMinutes * 60 * 1000;
    const reset = () => {
      if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
      this.inactivityTimer = setTimeout(() => this.logout(), timeoutMs);
    };
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt =>
      window.addEventListener(evt, reset, { passive: true })
    );
    reset();
  }

  private stopInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }
}
