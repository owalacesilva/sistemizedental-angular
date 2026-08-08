import { FormControl, FormGroup, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';

import { matchesControl, mustAccept } from './validators';

function group() {
  return new FormGroup({
    password: new FormControl('', { nonNullable: true }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [matchesControl('password')],
    }),
  });
}

describe('matchesControl', () => {
  it('flags the control when it diverges from its sibling', () => {
    const form = group();
    form.setValue({ password: 'correct-horse', confirmPassword: 'battery-staple' });

    expect(form.controls.confirmPassword.hasError('passwordMismatch')).toBe(true);
  });

  it('clears the error once the values agree', () => {
    const form = group();
    form.setValue({ password: 'correct-horse', confirmPassword: 'battery-staple' });
    form.setValue({ password: 'correct-horse', confirmPassword: 'correct-horse' });

    expect(form.controls.confirmPassword.errors).toBeNull();
  });

  it('leaves other validators errors in place', () => {
    const form = group();
    form.controls.confirmPassword.addValidators(Validators.minLength(20));
    form.setValue({ password: 'short', confirmPassword: 'short' });

    expect(form.controls.confirmPassword.hasError('minlength')).toBe(true);
    expect(form.controls.confirmPassword.hasError('passwordMismatch')).toBe(false);
  });

  it('stays quiet until the control has been filled in', () => {
    const form = group();
    form.setValue({ password: 'correct-horse', confirmPassword: '' });

    expect(form.controls.confirmPassword.hasError('passwordMismatch')).toBe(false);
  });

  it('is inert when the sibling does not exist', () => {
    const orphan = new FormControl('anything', { validators: [matchesControl('nope')] });

    expect(orphan.errors).toBeNull();
  });
});

describe('mustAccept', () => {
  it('rejects an unchecked box', () => {
    expect(mustAccept(new FormControl(false))).toEqual({ mustAccept: true });
  });

  it('accepts a checked box', () => {
    expect(mustAccept(new FormControl(true))).toBeNull();
  });
});
