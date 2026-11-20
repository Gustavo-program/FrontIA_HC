export interface TipoDocumentoIdentidad {
  tipoDocumentoIdentidadId: string;
  descripcion: string;
  abreviatura: string;
  longitud?: number;
  activo: boolean;
}

export interface ServicioClinico {
  servicioId: string;
  codigo?: string;
  nombre: string;
  servicioPadreId?: string;
  activo: boolean;
}

export interface Cie10 {
  cie10Id: string;
  codigo: string;
  descripcion: string;
  activo: boolean;
}

export interface Especialidad {
  especialidadId: string;
  codigo?: string;
  nombre: string;
  activa: boolean;
}

export interface TipoPersonalSalud {
  tipoPersonalId: string;
  nombre: string;
  estado: boolean;
}

export interface ConfiguracionSistema {
  configuracionId: string;
  clave: string;
  valor: any;
  descripcion?: string;
  editable: boolean;
}
