import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import type { AbstractControl, ControlEvent } from '@angular/forms';
import { EMPTY, switchMap } from 'rxjs';

import { injectT } from '../../../core/i18n/translate';
import { firstValidationMessage } from '../../forms/validation-messages';

/**
 * Renders the first validation message for a control, once the user has touched
 * or edited it.
 *
 * `AbstractControl` exposes `touched`/`errors` as plain properties, not signals —
 * a `computed()` over them would latch onto its first value and never update. The
 * control's `events` stream is the supported reactive source, so we mirror it into
 * a signal and use it purely as a change trigger.
 */
@Component({
  selector: 'app-field-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (message(); as text) {
      <p class="mt-1 text-xs font-medium text-rose-600">{{ text }}</p>
    }
  `,
})
export class FieldError {
  readonly control = input.required<AbstractControl | null>();
  /** Already-translated field name, woven into messages like "{label} is required." */
  readonly label = input<string | null>(null);

  private readonly t = injectT();

  private readonly events = toSignal<ControlEvent | null>(
    toObservable(this.control).pipe(switchMap((control) => control?.events ?? EMPTY)),
    { initialValue: null },
  );

  protected readonly message = computed(() => {
    this.events(); // dependency only — the control itself holds the state
    const control = this.control();

    if (!control || !(control.touched || control.dirty)) {
      return null;
    }

    return firstValidationMessage(
      control.errors,
      this.label() ?? this.t('validation.fallbackLabel'),
      this.t,
    );
  });
}
