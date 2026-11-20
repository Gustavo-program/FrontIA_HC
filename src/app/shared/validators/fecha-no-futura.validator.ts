import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function fechaNoFuturaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const selected = new Date(control.value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (selected > today) {
      return { fechaFutura: true };
    }
    return null;
  };
}
