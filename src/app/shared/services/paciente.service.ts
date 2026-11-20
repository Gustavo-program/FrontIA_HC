import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Page } from '../../core/models/api-response.model';
import { Paciente } from '../models/paciente.model';
import { HistoriaClinica } from '../models/historia-clinica.model';
import { Atencion } from '../models/atencion.model';
import { DocumentoClinico } from '../models/documento.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly api = inject(ApiService);

  getPacientes(page = 0, size = 10, search = ''): Observable<Page<Paciente>> {
    return this.api.getPage<Paciente>('/pacientes', page, size, { search });
  }

  getPaciente(id: string): Observable<Paciente> {
    return this.api.get<Paciente>(`/pacientes/${id}`);
  }

  crearPaciente(paciente: Partial<Paciente>): Observable<Paciente> {
    return this.api.post<Paciente>('/pacientes', paciente);
  }

  actualizarPaciente(id: string, paciente: Partial<Paciente>): Observable<Paciente> {
    return this.api.put<Paciente>(`/pacientes/${id}`, paciente);
  }

  darDeBaja(id: string): Observable<void> {
    return this.api.delete<void>(`/pacientes/${id}`);
  }

  getHistoriaClinica(pacienteId: string): Observable<HistoriaClinica> {
    return this.api.get<HistoriaClinica>(`/pacientes/${pacienteId}/historia-clinica`);
  }

  getHistoriaPorNumero(numeroHistoria: string): Observable<{ paciente: Paciente; historia: HistoriaClinica; atenciones: Atencion[]; documentos: DocumentoClinico[] }> {
    return this.api.get<{ paciente: Paciente; historia: HistoriaClinica; atenciones: Atencion[]; documentos: DocumentoClinico[] }>(`/historias/${numeroHistoria}`);
  }

  getAtenciones(pacienteId: string): Observable<Atencion[]> {
    return this.api.get<Atencion[]>(`/pacientes/${pacienteId}/atenciones`);
  }

  getDocumentos(pacienteId: string): Observable<DocumentoClinico[]> {
    return this.api.get<DocumentoClinico[]>(`/pacientes/${pacienteId}/documentos`);
  }
}
