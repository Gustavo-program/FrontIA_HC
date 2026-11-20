import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Cie10, Especialidad, ServicioClinico, TipoDocumentoIdentidad, ConfiguracionSistema } from '../models/catalogo.model';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly api = inject(ApiService);

  getCie10(q = ''): Observable<Cie10[]> {
    return this.api.get<Cie10[]>('/catalogos/cie10', { q });
  }

  getTiposDocumento(): Observable<TipoDocumentoIdentidad[]> {
    return this.api.get<TipoDocumentoIdentidad[]>('/catalogos/tipos-documento');
  }

  getEspecialidades(): Observable<Especialidad[]> {
    return this.api.get<Especialidad[]>('/especialidades');
  }

  getServicios(): Observable<ServicioClinico[]> {
    return this.api.get<ServicioClinico[]>('/servicios');
  }

  getParametros(): Observable<ConfiguracionSistema[]> {
    return this.api.get<ConfiguracionSistema[]>('/parametros');
  }

  guardarParametro(clave: string, valor: any): Observable<ConfiguracionSistema> {
    return this.api.put<ConfiguracionSistema>(`/parametros/${clave}`, { valor });
  }
}
