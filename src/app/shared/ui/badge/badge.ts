import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-50 text-slate-600 ring-slate-500/20',
  info: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

/** Status pill: a label, a tone, nothing else. */
@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ring-1 ring-inset"
      [class]="toneClass()"
    >
      <ng-content />
    </span>
  `,
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');

  protected readonly toneClass = computed(() => TONE_CLASSES[this.tone()]);
}
