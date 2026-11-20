import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Page } from '../../../core/models/api-response.model';
import { RevisionDocumental, CampoExtraido } from '../../../shared/models/documento.model';

@Injectable({ providedIn: 'root' })
export class ValidacionService {
  private readonly api = inject(ApiService);

  getRevisiones(page = 0, size = 10, estado = ''): Observable<Page<RevisionDocumental>> {
    return this.api.getPage<RevisionDocumental>('/validacion/revisiones', page, size, { estado });
  }

  getRevision(id: string): Observable<RevisionDocumental> {
    return this.api.get<RevisionDocumental>(`/validacion/revisiones/${id}`);
  }

  guardarCorrecciones(id: string, campos: CampoExtraido[]): Observable<void> {
    return this.api.put<void>(`/validacion/revisiones/${id}/campos`, { campos });
  }

  autorizar(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>(`/validacion/revisiones/${id}/autorizar`, {});
  }

  devolver(id: string, motivo: string): Observable<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>(`/validacion/revisiones/${id}/devolver`, { motivo });
  }
}
