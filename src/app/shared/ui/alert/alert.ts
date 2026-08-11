import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type AlertTone = 'error' | 'success' | 'info';

const TONE_CLASSES: Record<AlertTone, string> = {
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-brand-200 bg-brand-50 text-brand-800',
};

@Component({
  selector: 'app-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-relaxed"
      [class]="toneClass()"
      [attr.role]="tone() === 'error' ? 'alert' : 'status'"
    >
      <svg
        class="mt-px h-3.5 w-3.5 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        @if (tone() === 'error') {
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM9 5a1 1 0 0 1 2 0v5a1 1 0 1 1-2 0V5Zm1 10a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 10 15Z"
            clip-rule="evenodd"
          />
        } @else if (tone() === 'success') {
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.58 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z"
            clip-rule="evenodd"
          />
        } @else {
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm1-11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-2 3a1 1 0 0 1 2 0v4a1 1 0 1 1-2 0v-4Z"
            clip-rule="evenodd"
          />
        }
      </svg>
      <span class="min-w-0"><ng-content /></span>
    </div>
  `,
})
export class Alert {
  readonly tone = input<AlertTone>('error');

  protected readonly toneClass = computed(() => TONE_CLASSES[this.tone()]);
}
