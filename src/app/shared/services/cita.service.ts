import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Page } from '../../core/models/api-response.model';
import { Cita, EstadoCita } from '../models/cita.model';

@Injectable({ providedIn: 'root' })
export class CitaService {
  private readonly api = inject(ApiService);

  getCitas(page = 0, size = 10, estado?: EstadoCita, fecha?: string, medicoId?: string, search?: string): Observable<Page<Cita>> {
    return this.api.getPage<Cita>('/citas', page, size, { estado, fecha, medicoId, search });
  }

  getCita(id: string): Observable<Cita> {
    return this.api.get<Cita>(`/citas/${id}`);
  }

  crearCita(cita: Partial<Cita>): Observable<Cita> {
    return this.api.post<Cita>('/citas', cita);
  }

  actualizarCita(id: string, cita: Partial<Cita>): Observable<Cita> {
    return this.api.put<Cita>(`/citas/${id}`, cita);
  }

  eliminarCita(id: string): Observable<void> {
    return this.api.delete<void>(`/citas/${id}`);
  }

  cambiarEstado(id: string, estado: EstadoCita, motivo?: string): Observable<Cita> {
    return this.api.patch<Cita>(`/citas/${id}/estado`, { estado, motivo });
  }

  getCitasPendientes(page = 0, size = 10): Observable<Page<Cita>> {
    return this.api.getPage<Cita>('/citas', page, size, { estado: 'PENDIENTE' });
  }
}
