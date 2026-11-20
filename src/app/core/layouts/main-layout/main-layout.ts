import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { AuthStore } from '../../auth/auth.store';
import { AuthService } from '../../auth/auth.service';
import { LoadingService } from '../../services/loading.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  readonly store = inject(AuthStore);
  readonly authService = inject(AuthService);
  readonly loadingService = inject(LoadingService);
  readonly router = inject(Router);

  readonly isMobile = signal(window.innerWidth < 1024);
  readonly sidenavOpened = signal(!this.isMobile());

  readonly navItems: NavItem[] = [
    { label: 'Inicio', icon: 'dashboard', route: '/inicio', roles: ['ADMIN', 'DOCTOR', 'DIGITALIZADOR', 'ADMISION', 'RRHH'] },
    { label: 'Digitalización', icon: 'document_scanner', route: '/digitalizacion', roles: ['ADMIN', 'DIGITALIZADOR'] },
    { label: 'Validación de HC', icon: 'fact_check', route: '/validacion', roles: ['ADMIN', 'DIGITALIZADOR'] },
    { label: 'Atención Médica', icon: 'medical_services', route: '/atencion', roles: ['ADMIN', 'DOCTOR'] },
    { label: 'Historias Clínicas', icon: 'folder_shared', route: '/historias', roles: ['ADMIN', 'DOCTOR', 'ADMISION', 'DIGITALIZADOR'] },
    { label: 'Reportes Estadísticos', icon: 'bar_chart', route: '/reportes', roles: ['ADMIN', 'DOCTOR'] },
    { label: 'Pacientes', icon: 'person_search', route: '/admision/pacientes', roles: ['ADMIN', 'ADMISION'] },
    { label: 'Citas Médicas', icon: 'event', route: '/admision/citas', roles: ['ADMIN', 'ADMISION'] },
    { label: 'Horarios y Turnos', icon: 'schedule', route: '/horarios', roles: ['ADMIN', 'RRHH'] },
    { label: 'Citas Pendientes Pago', icon: 'payments', route: '/administracion/citas-pendientes', roles: ['ADMIN'] },
    { label: 'Gestión Usuarios', icon: 'manage_accounts', route: '/administracion/usuarios', roles: ['ADMIN'] },
    { label: 'Gestión Doctores', icon: 'badge', route: '/administracion/doctores', roles: ['ADMIN'] },
    { label: 'Gestión Personal', icon: 'groups', route: '/administracion/personal', roles: ['ADMIN'] },
    { label: 'Catálogos Clínicos', icon: 'category', route: '/administracion/catalogos', roles: ['ADMIN'] },
    { label: 'Parámetros del Sistema', icon: 'settings', route: '/administracion/parametros', roles: ['ADMIN'] },
    { label: 'Auditoría', icon: 'security', route: '/auditoria', roles: ['ADMIN'] }
  ];

  readonly filteredNavItems = computed(() => {
    const userRoles = this.store.roles();
    return this.navItems.filter(item => item.roles.some(r => userRoles.includes(r as any)));
  });

  constructor() {
    window.addEventListener('resize', () => {
      const mobile = window.innerWidth < 1024;
      this.isMobile.set(mobile);
      if (!mobile && !this.sidenavOpened()) {
        this.sidenavOpened.set(true);
      }
    });
  }

  toggleSidenav(): void {
    this.sidenavOpened.update(v => !v);
  }

  closeIfMobile(): void {
    if (this.isMobile()) {
      this.sidenavOpened.set(false);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
