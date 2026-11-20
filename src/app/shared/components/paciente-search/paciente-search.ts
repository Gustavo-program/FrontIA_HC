import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { PacienteService } from '../../services/paciente.service';
import { Paciente } from '../../models/paciente.model';
import { NombreCompletoPipe } from '../../pipes/nombre-completo.pipe';

@Component({
  selector: 'app-paciente-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    NombreCompletoPipe
  ],
  templateUrl: './paciente-search.html',
  styleUrl: './paciente-search.scss'
})
export class PacienteSearch implements OnInit {
  private readonly pacienteService = inject(PacienteService);

  readonly searchControl = new FormControl<any>('');
  pacientes: Paciente[] = [];
  loading = false;

  @Input() set pacientePreseleccionado(pac: Paciente | null) {
    if (pac) {
      this.searchControl.setValue(pac, { emitEvent: false });
    } else {
      this.searchControl.setValue('', { emitEvent: false });
    }
  }

  @Output() pacienteSelected = new EventEmitter<Paciente>();

  ngOnInit(): void {
    this.cargarPacientes('');

    this.searchControl.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(query => {
        if (typeof query === 'object' && query !== null) {
          return of({ content: this.pacientes });
        }
        const term = typeof query === 'string' ? query.trim() : '';
        this.loading = true;
        return this.pacienteService.getPacientes(0, 15, term);
      })
    ).subscribe({
      next: res => {
        this.pacientes = res.content || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  cargarPacientes(query = ''): void {
    this.loading = true;
    this.pacienteService.getPacientes(0, 15, query).subscribe({
      next: res => {
        this.pacientes = res.content || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onFocus(): void {
    const val = this.searchControl.value;
    if (!val || typeof val === 'string') {
      this.cargarPacientes(typeof val === 'string' ? val.trim() : '');
    }
  }

  displayFn(paciente: any): string {
    if (!paciente) return '';
    if (typeof paciente === 'string') return paciente;
    return `${paciente.nombres || ''} ${paciente.apellidoPaterno || ''} - HC: ${paciente.numeroHistoria || 'S/N'}`;
  }

  onSelect(event: any): void {
    const paciente = event.option.value as Paciente;
    this.pacienteSelected.emit(paciente);
  }
}
