import type { ValidationErrors } from '@angular/forms';

import type { TranslateFn } from '../../core/i18n/i18n.models';

type MessageFactory = (error: unknown, label: string, t: TranslateFn) => string;

function requiredLength(error: unknown): number {
  return (error as { requiredLength: number }).requiredLength;
}

const MESSAGES: Record<string, MessageFactory> = {
  required: (_error, label, t) => t('validation.required', { label }),
  email: (_error, _label, t) => t('validation.email'),
  minlength: (error, label, t) =>
    t('validation.minLength', { label, length: requiredLength(error) }),
  maxlength: (error, label, t) =>
    t('validation.maxLength', { label, length: requiredLength(error) }),
  pattern: (_error, label, t) => t('validation.pattern', { label }),
  passwordMismatch: (_error, _label, t) => t('validation.mismatch'),
  mustAccept: (_error, _label, t) => t('validation.mustAccept'),
};

/**
 * Turns the first validation error on a control into a human sentence.
 *
 * `label` arrives already translated — the caller knows which field it is
 * describing, and reusing the same `field.*` keys the form labels use keeps the
 * two in step.
 */
export function firstValidationMessage(
  errors: ValidationErrors | null,
  label: string,
  t: TranslateFn,
): string | null {
  if (!errors) {
    return null;
  }

  for (const [key, value] of Object.entries(errors)) {
    const factory = MESSAGES[key];
    if (factory) {
      return factory(value, label, t);
    }
  }

  return t('validation.invalid', { label });
}
