import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Cita } from '../../../shared/models/cita.model';
import { Atencion } from '../../../shared/models/atencion.model';
import { Receta } from '../../../shared/models/receta.model';

@Injectable({ providedIn: 'root' })
export class AtencionService {
  private readonly api = inject(ApiService);

  getAgenda(fecha?: string): Observable<Cita[]> {
    return this.api.get<Cita[]>('/atenciones/agenda', { fecha });
  }

  guardarAtencion(atencion: Partial<Atencion>): Observable<Atencion> {
    if (atencion.atencionId) {
      return this.api.put<Atencion>(`/atenciones/${atencion.atencionId}`, atencion);
    }
    return this.api.post<Atencion>('/atenciones', atencion);
  }

  finalizarAtencion(id: string): Observable<Atencion> {
    return this.api.post<Atencion>(`/atenciones/${id}/finalizar`, {});
  }

  enviarReceta(recetaId: string, canal: 'EMAIL' | 'WHATSAPP', destino: string): Observable<{ success: boolean; mensaje: string }> {
    return this.api.post<{ success: boolean; mensaje: string }>(`/recetas/${recetaId}/enviar`, { canal, destino });
  }
}
