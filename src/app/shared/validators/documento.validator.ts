import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function documentoValidator(longitudEsperada?: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const val = String(control.value).trim();

    if (longitudEsperada && val.length !== longitudEsperada) {
      return { longitudInvalida: { esperada: longitudEsperada, actual: val.length } };
    }
    // Only numbers for typical docs
    if (/^\d+$/.test(val) === false) {
      return { soloDigitos: true };
    }
    return null;
  };
}
