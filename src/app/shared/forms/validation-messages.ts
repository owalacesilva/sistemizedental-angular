import type { ValidationErrors } from '@angular/forms';

type MessageFactory = (error: unknown, label: string) => string;

const MESSAGES: Record<string, MessageFactory> = {
  required: (_error, label) => `${label} is required.`,
  email: () => 'Enter a valid email address.',
  minlength: (error, label) => {
    const required = (error as { requiredLength: number }).requiredLength;
    return `${label} must be at least ${required} characters.`;
  },
  maxlength: (error, label) => {
    const required = (error as { requiredLength: number }).requiredLength;
    return `${label} must be at most ${required} characters.`;
  },
  passwordMismatch: () => 'Passwords do not match.',
  mustAccept: () => 'You must accept the terms to continue.',
};

/** Turns the first validation error on a control into a human sentence. */
export function firstValidationMessage(
  errors: ValidationErrors | null,
  label: string,
): string | null {
  if (!errors) {
    return null;
  }

  for (const [key, value] of Object.entries(errors)) {
    const factory = MESSAGES[key];
    if (factory) {
      return factory(value, label);
    }
  }

  return `${label} is invalid.`;
}
