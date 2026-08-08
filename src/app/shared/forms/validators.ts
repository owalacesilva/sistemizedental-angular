import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Control-level validator: fails when the control's value differs from a sibling's.
 *
 * Deliberately a *control* validator rather than a group one — a group validator
 * would have to reach in with `setErrors()`, which Angular then overwrites the next
 * time the child revalidates. The trade-off is that the sibling's changes must
 * trigger a revalidation here; see `revalidateOnChangesOf`.
 */
export function matchesControl(siblingName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const sibling = control.parent?.get(siblingName);

    // Nothing to compare against yet — stay quiet until the user has typed.
    if (!sibling || !control.value) {
      return null;
    }

    return sibling.value === control.value ? null : { passwordMismatch: true };
  };
}

/** Requires a checkbox to be ticked (e.g. terms of service). */
export const mustAccept: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  control.value === true ? null : { mustAccept: true };
