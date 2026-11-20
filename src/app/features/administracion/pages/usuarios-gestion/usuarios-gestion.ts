import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { UsuarioService, UsuarioFormPayload } from '../../../../shared/services/usuario.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthStore } from '../../../../core/auth/auth.store';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { UsuarioSesion, RolCodigo } from '../../../../core/models/session.model';

@Component({
  selector: 'app-usuarios-gestion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    PageHeader
  ],
  templateUrl: './usuarios-gestion.html',
  styleUrl: './usuarios-gestion.scss'
})
export class UsuariosGestion implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly notification = inject(NotificationService);
  private readonly authStore = inject(AuthStore);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  readonly usuarios = signal<(UsuarioSesion & { activo?: boolean })[]>([]);
  readonly search = signal<string>('');
  readonly filtroRol = signal<string>('TODOS');
  readonly guardando = signal<boolean>(false);
  readonly formularioAbierto = signal<boolean>(false);
  readonly modoEdicion = signal<boolean>(false);
  readonly usuarioSeleccionado = signal<(UsuarioSesion & { activo?: boolean }) | null>(null);
  readonly ocultarPassword = signal<boolean>(true);

  readonly columns = ['usuario', 'nombre', 'roles', 'seguridad', 'estado', 'acciones'];

  readonly form = this.fb.group({
    nombreUsuario: ['', Validators.required],
    nombreCompleto: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    password: [''],
    rolCodigo: ['DOCTOR' as RolCodigo, Validators.required],
    debeCambiarClave: [false],
    activo: [true]
  });

  readonly usuariosFiltrados = computed(() => {
    const list = this.usuarios();
    const rol = this.filtroRol();
    if (rol === 'TODOS') {
      return list;
    }
    return list.filter(u => u.roles.some(r => r.codigo === rol));
  });

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.getUsuarios(0, 50, this.search()).subscribe({
      next: page => this.usuarios.set(page.content || [])
    });
  }

  toggleOcultarPassword(): void {
    this.ocultarPassword.update(v => !v);
  }

  abrirNuevo(): void {
    this.modoEdicion.set(false);
    this.usuarioSeleccionado.set(null);
    this.form.reset({
      nombreUsuario: '',
      nombreCompleto: '',
      correo: '',
      password: '',
      rolCodigo: 'DOCTOR',
      debeCambiarClave: true,
      activo: true
    });
    this.form.get('nombreUsuario')?.enable();
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.get('password')?.updateValueAndValidity();
    this.ocultarPassword.set(true);
    this.formularioAbierto.set(true);
  }

  abrirEditar(u: UsuarioSesion & { activo?: boolean }): void {
    this.modoEdicion.set(true);
    this.usuarioSeleccionado.set(u);

    const rolPrincipal = (u.roles[0]?.codigo as RolCodigo) || 'DOCTOR';
    this.form.patchValue({
      nombreUsuario: u.nombreUsuario,
      nombreCompleto: u.nombreCompleto,
      correo: u.correo,
      password: '',
      rolCodigo: rolPrincipal,
      debeCambiarClave: u.debeCambiarClave ?? false,
      activo: u.activo !== false
    });

    // En edición, no se cambia el username y la contraseña es opcional
    this.form.get('nombreUsuario')?.disable();
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.setValidators([Validators.minLength(8)]);
    this.form.get('password')?.updateValueAndValidity();
    this.ocultarPassword.set(true);
    this.formularioAbierto.set(true);
  }

  cerrarFormulario(): void {
    this.formularioAbierto.set(false);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const rawVal = this.form.getRawValue();

    if (this.modoEdicion() && this.usuarioSeleccionado()) {
      const payload: Partial<UsuarioFormPayload> = {
        nombreCompleto: rawVal.nombreCompleto || '',
        correo: rawVal.correo || '',
        rolCodigo: rawVal.rolCodigo as RolCodigo,
        debeCambiarClave: !!rawVal.debeCambiarClave,
        activo: !!rawVal.activo
      };
      if (rawVal.password) {
        payload.password = rawVal.password;
      }

      this.usuarioService.actualizarUsuario(this.usuarioSeleccionado()!.usuarioId, payload).subscribe({
        next: () => {
          this.guardando.set(false);
          this.notification.success(`Usuario "${rawVal.nombreUsuario}" actualizado con éxito.`);
          this.cerrarFormulario();
          this.cargarUsuarios();
        },
        error: () => this.guardando.set(false)
      });
    } else {
      const payload: UsuarioFormPayload = {
        nombreUsuario: rawVal.nombreUsuario || '',
        nombreCompleto: rawVal.nombreCompleto || '',
        correo: rawVal.correo || '',
        password: rawVal.password || '12345678',
        rolCodigo: rawVal.rolCodigo as RolCodigo,
        debeCambiarClave: !!rawVal.debeCambiarClave,
        activo: !!rawVal.activo
      };

      this.usuarioService.crearUsuario(payload).subscribe({
        next: () => {
          this.guardando.set(false);
          this.notification.success(`Nuevo usuario "${payload.nombreUsuario}" creado correctamente.`);
          this.cerrarFormulario();
          this.cargarUsuarios();
        },
        error: () => this.guardando.set(false)
      });
    }
  }

  toggleEstado(u: UsuarioSesion & { activo?: boolean }): void {
    const nuevoEstado = !(u.activo !== false);
    const accion = nuevoEstado ? 'habilitar' : 'deshabilitar';

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: `${nuevoEstado ? 'Habilitar' : 'Deshabilitar'} Cuenta de Usuario`,
        message: `¿Confirma ${accion} el acceso de "${u.nombreUsuario}" (${u.nombreCompleto}) al sistema?`,
        confirmText: nuevoEstado ? 'Habilitar' : 'Deshabilitar',
        color: nuevoEstado ? 'primary' : 'warn',
        icon: nuevoEstado ? 'check_circle' : 'block'
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.usuarioService.toggleEstado(u.usuarioId, nuevoEstado).subscribe({
          next: () => {
            this.notification.success(`Usuario "${u.nombreUsuario}" ${nuevoEstado ? 'habilitado' : 'deshabilitado'}.`);
            this.cargarUsuarios();
          }
        });
      }
    });
  }

  eliminar(u: UsuarioSesion & { activo?: boolean }): void {
    if (this.esUsuarioActual(u)) {
      this.notification.warning('No es posible eliminar su propio usuario activo en sesión.');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Eliminar Cuenta de Usuario',
        message: `¿Está seguro de eliminar definitivamente al usuario "${u.nombreUsuario}" (${u.nombreCompleto})? Esta acción revocará todos sus permisos.`,
        confirmText: 'Eliminar',
        color: 'warn',
        icon: 'delete_forever'
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.usuarioService.eliminarUsuario(u.usuarioId).subscribe({
          next: () => {
            this.notification.success(`Usuario "${u.nombreUsuario}" eliminado del sistema.`);
            this.cargarUsuarios();
          }
        });
      }
    });
  }

  esUsuarioActual(u: UsuarioSesion): boolean {
    const sesion = this.authStore.usuario();
    return !!sesion && (sesion.usuarioId === u.usuarioId || sesion.nombreUsuario.toLowerCase() === u.nombreUsuario.toLowerCase());
  }

  getRoleClass(codigo: string): string {
    switch (codigo) {
      case 'ADMIN': return 'role-admin';
      case 'DOCTOR': return 'role-doctor';
      case 'DIGITALIZADOR': return 'role-digitalizador';
      case 'ADMISION': return 'role-admision';
      case 'RRHH': return 'role-rrhh';
      default: return 'role-doctor';
    }
  }
}
