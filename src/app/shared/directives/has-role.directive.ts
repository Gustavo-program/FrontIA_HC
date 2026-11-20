import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthStore } from '../../core/auth/auth.store';
import { RolCodigo } from '../../core/models/session.model';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly store = inject(AuthStore);

  private allowedRoles: RolCodigo[] = [];
  private hasView = false;

  @Input()
  set appHasRole(roles: RolCodigo | RolCodigo[]) {
    this.allowedRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  constructor() {
    effect(() => {
      // Re-evaluate when user roles change
      this.store.roles();
      this.updateView();
    });
  }

  private updateView(): void {
    const hasPermission = this.store.tieneAlgunRol(this.allowedRoles);

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
