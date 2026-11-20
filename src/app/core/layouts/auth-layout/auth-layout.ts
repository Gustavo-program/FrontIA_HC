import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-wrapper">
      <div class="auth-overlay"></div>
      <div class="auth-card-wrapper">
        <div class="auth-brand">
          <div class="logo-box">INSN</div>
          <h2>Instituto Nacional de Salud del Niño</h2>
          <p class="brand-sub">Sistema de Gestión de Historias Clínicas Electrónicas</p>
        </div>
        <div class="auth-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styleUrl: './auth-layout.scss'
})
export class AuthLayout {}
