import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-cambio-clave',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './cambio-clave.html',
  styleUrl: './cambio-clave.scss'
})
export class CambioClave {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(false);

  readonly form = this.fb.group({
    claveActual: ['', Validators.required],
    nuevaClave: ['', [Validators.required, Validators.minLength(8)]],
    confirmarClave: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { claveActual, nuevaClave, confirmarClave } = this.form.getRawValue();
    if (nuevaClave !== confirmarClave) {
      this.notification.error('Las contraseñas no coinciden.');
      return;
    }

    this.loading.set(true);
    this.authService.cambiarClave({ claveActual: claveActual!, nuevaClave: nuevaClave!, confirmarClave: confirmarClave! }).subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success('Contraseña actualizada con éxito.');
        this.router.navigate(['/inicio']);
      },
      error: () => this.loading.set(false)
    });
  }

  cancelar(): void {
    this.router.navigate(['/inicio']);
  }
}
