import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { I18nService } from '../../../core/i18n/i18n.service';
import { Badge } from '../badge/badge';

/** Namespaced so it never collides with the legacy `acc_*` keys. */
const STORAGE_PREFIX = 'app_filters:';

let nextId = 0;

function readOpen(key: string, fallback: boolean): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    return stored === null ? fallback : stored === 'open';
  } catch {
    return fallback;
  }
}

function writeOpen(key: string, open: boolean): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, open ? 'open' : 'closed');
  } catch {
    // The panel simply reopens at its default next visit.
  }
}

/**
 * A filter bar that folds away.
 *
 * Screens like the ledger carry six or seven controls that are set once and then
 * only get in the way of the rows. Collapsing keeps them one click from reach
 * while the count badge means a folded panel can never hide the fact that
 * something is being filtered out. The choice is remembered per panel.
 *
 * Filter controls go in the default slot; anything that should stay visible
 * while collapsed — a refresh button, a total — goes in `[panelActions]`.
 */
@Component({
  selector: 'app-filter-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Badge],
  template: `
    <section class="app-card overflow-hidden">
      <div class="flex flex-wrap items-center gap-2 px-3 py-2">
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          (click)="toggle()"
          [attr.aria-expanded]="open()"
          [attr.aria-controls]="bodyId"
          [attr.title]="open() ? t('filters.hide') : t('filters.show')"
        >
          <svg
            class="h-4 w-4 text-slate-400 transition-transform duration-200"
            [class.rotate-180]="open()"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {{ heading() ?? t('filters.title') }}
        </button>

        @if (activeCount()) {
          <app-badge tone="info">{{ activeLabel() }}</app-badge>

          <button
            type="button"
            class="text-xs font-medium text-slate-500 underline underline-offset-2 transition hover:text-slate-700"
            (click)="clear.emit()"
          >
            {{ t('filters.clear') }}
          </button>
        }

        <div class="ml-auto flex flex-wrap items-center gap-2">
          <ng-content select="[panelActions]" />
        </div>
      </div>

      @if (open()) {
        <div
          [id]="bodyId"
          class="flex flex-wrap items-end gap-x-3 gap-y-2.5 border-t border-slate-200/70 px-3 py-2.5"
        >
          <ng-content />
        </div>
      }
    </section>
  `,
})
export class FilterPanel {
  /** Identifies the panel in storage; unique per screen. */
  readonly panelKey = input.required<string>();
  /** How many filters are away from their default — drives the badge. */
  readonly activeCount = input(0);
  readonly openByDefault = input(true);
  readonly heading = input<string | null>(null);

  readonly clear = output<void>();

  protected readonly bodyId = `filter-panel-${(nextId += 1)}`;

  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t;

  private readonly overridden = signal<boolean | null>(null);

  protected readonly open = computed(
    () => this.overridden() ?? readOpen(this.panelKey(), this.openByDefault()),
  );

  protected readonly activeLabel = computed(() =>
    this.i18n.plural('filters.active', this.activeCount()),
  );

  protected toggle(): void {
    const next = !this.open();
    writeOpen(this.panelKey(), next);
    this.overridden.set(next);
  }
}
