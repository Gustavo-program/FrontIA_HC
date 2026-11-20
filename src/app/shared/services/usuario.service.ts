import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Page } from '../../core/models/api-response.model';
import { UsuarioSesion, RolCodigo } from '../../core/models/session.model';

export interface UsuarioFormPayload {
  usuarioId?: string;
  nombreUsuario: string;
  nombreCompleto: string;
  correo: string;
  password?: string;
  rolCodigo: RolCodigo;
  debeCambiarClave: boolean;
  activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly api = inject(ApiService);

  getUsuarios(page = 0, size = 10, search = ''): Observable<Page<UsuarioSesion & { activo?: boolean }>> {
    return this.api.getPage<UsuarioSesion & { activo?: boolean }>('/usuarios', page, size, { search });
  }

  getUsuario(id: string): Observable<UsuarioSesion & { activo?: boolean }> {
    return this.api.get<UsuarioSesion & { activo?: boolean }>(`/usuarios/${id}`);
  }

  crearUsuario(usuario: UsuarioFormPayload): Observable<UsuarioSesion> {
    return this.api.post<UsuarioSesion>('/usuarios', usuario);
  }

  actualizarUsuario(id: string, usuario: Partial<UsuarioFormPayload>): Observable<UsuarioSesion> {
    return this.api.put<UsuarioSesion>(`/usuarios/${id}`, usuario);
  }

  eliminarUsuario(id: string): Observable<void> {
    return this.api.delete<void>(`/usuarios/${id}`);
  }

  toggleEstado(id: string, activo: boolean): Observable<UsuarioSesion> {
    return this.api.patch<UsuarioSesion>(`/usuarios/${id}/estado`, { activo });
  }
}
