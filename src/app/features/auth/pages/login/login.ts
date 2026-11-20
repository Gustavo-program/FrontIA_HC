import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  readonly hidePassword = signal(true);
  readonly loading = signal(false);

  readonly loginForm = this.fb.group({
    nombreUsuario: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { nombreUsuario, password } = this.loginForm.getRawValue();

    this.authService.login({ nombreUsuario: nombreUsuario!, password: password! }).subscribe({
      next: res => {
        this.loading.set(false);
        this.notification.success(`¡Bienvenido, ${res.usuario.nombreCompleto}!`);
        if (res.usuario.debeCambiarClave) {
          this.router.navigate(['/cambio-clave']);
        } else {
          this.router.navigate(['/inicio']);
        }
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  fillQuickUser(user: string, pass: string): void {
    this.loginForm.patchValue({ nombreUsuario: user, password: pass });
  }
}
