import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombreCompleto',
  standalone: true
})
export class NombreCompletoPipe implements PipeTransform {
  transform(item: { nombres?: string; apellidoPaterno?: string; apellidoMaterno?: string } | null | undefined): string {
    if (!item) return '';
    const parts = [item.nombres, item.apellidoPaterno, item.apellidoMaterno].filter(Boolean);
    return parts.join(' ');
  }
}
