import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Page } from '../../core/models/api-response.model';
import { Medico, PersonalSalud } from '../models/medico.model';
import { Cupo } from '../models/cita.model';

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private readonly api = inject(ApiService);

  getMedicos(page = 0, size = 10, search = '', especialidadId = ''): Observable<Page<Medico>> {
    return this.api.getPage<Medico>('/medicos', page, size, { search, especialidadId });
  }

  getMedico(id: string): Observable<Medico> {
    return this.api.get<Medico>(`/medicos/${id}`);
  }

  crearMedico(medico: any): Observable<Medico> {
    return this.api.post<Medico>('/medicos', medico);
  }

  actualizarMedico(id: string, medico: any): Observable<Medico> {
    return this.api.put<Medico>(`/medicos/${id}`, medico);
  }

  eliminarMedico(id: string): Observable<void> {
    return this.api.delete<void>(`/medicos/${id}`);
  }

  getCupos(medicoId: string, fecha: string): Observable<Cupo[]> {
    return this.api.get<Cupo[]>(`/medicos/${medicoId}/cupos`, { fecha });
  }

  getPersonal(page = 0, size = 10, search = '', tipo = ''): Observable<Page<PersonalSalud>> {
    return this.api.getPage<PersonalSalud>('/personal', page, size, { search, tipo });
  }

  crearPersonal(personal: any): Observable<PersonalSalud> {
    return this.api.post<PersonalSalud>('/personal', personal);
  }

  actualizarPersonal(id: string, personal: any): Observable<PersonalSalud> {
    return this.api.put<PersonalSalud>(`/personal/${id}`, personal);
  }

  eliminarPersonal(id: string): Observable<void> {
    return this.api.delete<void>(`/personal/${id}`);
  }
}
