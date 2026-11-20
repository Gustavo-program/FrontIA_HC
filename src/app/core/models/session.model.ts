export type RolCodigo = 'ADMIN' | 'DOCTOR' | 'DIGITALIZADOR' | 'ADMISION' | 'RRHH';

export interface Rol {
  rolId: string;
  codigo: RolCodigo;
  nombre: string;
  descripcion?: string;
}

export interface UsuarioSesion {
  usuarioId: string;
  personalId?: string;
  medicoId?: string;
  nombreUsuario: string;
  nombreCompleto: string;
  correo: string;
  roles: Rol[];
  debeCambiarClave: boolean;
}

export interface LoginRequest {
  nombreUsuario: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  usuario: UsuarioSesion;
}

export interface CambioClaveRequest {
  claveActual: string;
  nuevaClave: string;
  confirmarClave: string;
}
