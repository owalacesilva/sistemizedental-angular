import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type LogoTone = 'brand' | 'inverted';

@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-2.5">
      <svg
        class="h-8 w-8 shrink-0"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="9" [attr.fill]="markBackground()" />
        <path
          d="M16 8.4c-1.6-1.6-4.3-1.9-6-.5-1.9 1.6-2.2 4.6-1.4 7.6.5 1.9 1.3 4 1.9 5.9.4 1.3.8 2.4 1.6 2.4.9 0 1.2-1.2 1.5-2.8.3-1.5.7-2.9 2.4-2.9s2.1 1.4 2.4 2.9c.3 1.6.6 2.8 1.5 2.8.8 0 1.2-1.1 1.6-2.4.6-1.9 1.4-4 1.9-5.9.8-3 .5-6-1.4-7.6-1.7-1.4-4.4-1.1-6 .5Z"
          [attr.fill]="markForeground()"
        />
      </svg>
      @if (showWordmark()) {
        <span class="text-lg font-semibold tracking-tight" [class]="wordmarkClass()">
          Sistemize<span class="font-normal">Dental</span>
        </span>
      }
    </span>
  `,
})
export class Logo {
  readonly tone = input<LogoTone>('brand');
  readonly showWordmark = input(true);

  protected readonly markBackground = computed(() =>
    this.tone() === 'inverted' ? '#ffffff' : '#03045e',
  );
  protected readonly markForeground = computed(() =>
    this.tone() === 'inverted' ? '#0077b6' : '#90e0ef',
  );
  protected readonly wordmarkClass = computed(() =>
    this.tone() === 'inverted' ? 'text-white' : 'text-brand-900',
  );
}
