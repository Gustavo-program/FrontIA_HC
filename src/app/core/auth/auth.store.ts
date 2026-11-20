import { Injectable, computed, signal } from '@angular/core';
import { UsuarioSesion, RolCodigo } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _usuario = signal<UsuarioSesion | null>(null);
  private readonly _autenticado = signal<boolean>(false);

  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = this._autenticado.asReadonly();

  readonly roles = computed(() => this._usuario()?.roles.map(r => r.codigo) ?? []);
  readonly nombreCompleto = computed(() => this._usuario()?.nombreCompleto ?? '');
  readonly debeCambiarClave = computed(() => this._usuario()?.debeCambiarClave ?? false);
  readonly medicoId = computed(() => this._usuario()?.medicoId ?? null);

  readonly esAdmin = computed(() => this.roles().includes('ADMIN'));
  readonly esDoctor = computed(() => this.roles().includes('DOCTOR'));
  readonly esDigitalizador = computed(() => this.roles().includes('DIGITALIZADOR'));
  readonly esAdmision = computed(() => this.roles().includes('ADMISION'));
  readonly esRRHH = computed(() => this.roles().includes('RRHH'));

  constructor() {
    const saved = sessionStorage.getItem('hc_user');
    if (saved) {
      try {
        const u = JSON.parse(saved) as UsuarioSesion;
        this.setUsuario(u);
      } catch {
        this.clear();
      }
    }
  }

  setUsuario(usuario: UsuarioSesion): void {
    this._usuario.set(usuario);
    this._autenticado.set(true);
    sessionStorage.setItem('hc_user', JSON.stringify(usuario));
  }

  actualizarDebeCambiarClave(valor: boolean): void {
    const u = this._usuario();
    if (u) {
      const updated = { ...u, debeCambiarClave: valor };
      this.setUsuario(updated);
    }
  }

  clear(): void {
    this._usuario.set(null);
    this._autenticado.set(false);
    sessionStorage.removeItem('hc_user');
  }

  tieneRol(rol: RolCodigo): boolean {
    return this.roles().includes(rol);
  }

  tieneAlgunRol(roles: RolCodigo[]): boolean {
    return roles.some(r => this.roles().includes(r));
  }
}
