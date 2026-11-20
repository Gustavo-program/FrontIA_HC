import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Page } from '../../../core/models/api-response.model';
import { DocumentoClinico } from '../../../shared/models/documento.model';

@Injectable({ providedIn: 'root' })
export class DigitalizacionService {
  private readonly api = inject(ApiService);

  subirDocumento(file: File): Observable<DocumentoClinico> {
    const formData = new FormData();
    formData.append('archivo', file);
    return this.api.upload<DocumentoClinico>('/digitalizacion/documentos', formData);
  }

  getDocumentos(page = 0, size = 10, estado = ''): Observable<Page<DocumentoClinico>> {
    return this.api.getPage<DocumentoClinico>('/digitalizacion/documentos', page, size, { estado });
  }

  reprocesar(id: string): Observable<DocumentoClinico> {
    return this.api.post<DocumentoClinico>(`/digitalizacion/documentos/${id}/reprocesar`, {});
  }

  eliminarDocumento(id: string): Observable<void> {
    return this.api.delete<void>(`/digitalizacion/documentos/${id}`);
  }
}
