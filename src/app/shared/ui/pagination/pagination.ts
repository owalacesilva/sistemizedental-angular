import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { injectT } from '../../../core/i18n/translate';

/** A page number, or the elided run between two of them. */
type PageToken = number | 'gap';

/** Page numbers either side of the current one that always stay visible. */
const WINDOW = 1;

/** Below this many pages every number fits, so no elision is needed. */
const ELISION_THRESHOLD = 7;

export const DEFAULT_PAGE_SIZES: readonly number[] = [10, 25, 50, 100];

/** Pager for every table in the app. Pages are 1-based. */
@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2"
      [class.border-t]="divided()"
      [class.border-slate-200/70]="divided()"
      [attr.aria-label]="t('pagination.label')"
    >
      <p class="text-xs text-slate-500">
        @if (total()) {
          {{ t('pagination.showing', { first: firstRow(), last: lastRow(), total: total() }) }}
        } @else {
          {{ t('pagination.noRecords') }}
        }
      </p>

      <div class="flex flex-wrap items-center gap-3">
        @if (pageSizes().length > 1) {
          <label class="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            {{ t('pagination.perPage') }}
            <select
              class="app-input w-auto py-1 pr-7 pl-2 text-xs"
              [value]="pageSize()"
              (change)="changePageSize($any($event.target).value)"
              [attr.aria-label]="t('pagination.perPageLabel')"
            >
              @for (size of pageSizes(); track size) {
                <option [value]="size">{{ size }}</option>
              }
            </select>
          </label>
        }

        <!-- The numbers are a lot on a phone; there the page count says it instead. -->
        <span class="text-xs font-medium text-slate-500 sm:hidden">
          {{ t('pagination.pageOf', { page: page(), pages: totalPages() }) }}
        </span>

        <div class="flex items-center gap-1">
          <button
            type="button"
            class="app-btn app-btn-quiet px-2 py-1 text-xs"
            (click)="goTo(page() - 1)"
            [disabled]="page() <= 1"
          >
            {{ t('pagination.previous') }}
          </button>

          <div class="hidden items-center gap-0.5 sm:flex">
            @for (token of tokens(); track $index) {
              @if (token === 'gap') {
                <span class="px-1 text-xs text-slate-400" aria-hidden="true">…</span>
              } @else {
                <button
                  type="button"
                  class="min-w-7 rounded-md px-1.5 py-1 text-xs font-semibold transition"
                  [class]="
                    token === page()
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  "
                  [attr.aria-current]="token === page() ? 'page' : null"
                  [attr.aria-label]="t('pagination.goToPage', { page: token })"
                  (click)="goTo(token)"
                >
                  {{ token }}
                </button>
              }
            }
          </div>

          <button
            type="button"
            class="app-btn app-btn-quiet px-2 py-1 text-xs"
            (click)="goTo(page() + 1)"
            [disabled]="page() >= totalPages()"
          >
            {{ t('pagination.next') }}
          </button>
        </div>
      </div>
    </nav>
  `,
})
export class Pagination {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();
  /** Pass a single-entry list to hide the rows-per-page control. */
  readonly pageSizes = input<readonly number[]>(DEFAULT_PAGE_SIZES);
  /** False when the pager stands alone rather than under a table. */
  readonly divided = input(true);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  protected readonly t = injectT();

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );

  protected readonly firstRow = computed(() => (this.page() - 1) * this.pageSize() + 1);
  protected readonly lastRow = computed(() =>
    Math.min(this.page() * this.pageSize(), this.total()),
  );

  /** First and last page always shown; everything far from the cursor elided. */
  protected readonly tokens = computed<readonly PageToken[]>(() => {
    const pages = this.totalPages();
    const current = this.page();

    if (pages <= ELISION_THRESHOLD) {
      return Array.from({ length: pages }, (_, index) => index + 1);
    }

    const from = Math.max(2, current - WINDOW);
    const to = Math.min(pages - 1, current + WINDOW);
    const tokens: PageToken[] = [1];

    if (from > 2) {
      tokens.push('gap');
    }
    for (let page = from; page <= to; page += 1) {
      tokens.push(page);
    }
    if (to < pages - 1) {
      tokens.push('gap');
    }

    return [...tokens, pages];
  });

  protected goTo(page: number): void {
    const target = Math.min(Math.max(1, page), this.totalPages());
    if (target !== this.page()) {
      this.pageChange.emit(target);
    }
  }

  protected changePageSize(value: string): void {
    const size = Number(value);
    if (Number.isFinite(size) && size > 0 && size !== this.pageSize()) {
      this.pageSizeChange.emit(size);
    }
  }
}
