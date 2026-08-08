import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/** Page-at-a-time pager for the server-side tables. Pages are 1-based. */
@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 px-5 py-3.5"
      aria-label="Pagination"
    >
      <p class="text-xs text-slate-500">
        @if (total()) {
          Showing
          <span class="font-semibold text-slate-700">{{ firstRow() }}–{{ lastRow() }}</span>
          of <span class="font-semibold text-slate-700">{{ total() }}</span>
        } @else {
          No records
        }
      </p>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          (click)="pageChange.emit(page() - 1)"
          [disabled]="page() <= 1"
        >
          Previous
        </button>
        <span class="px-1.5 text-xs font-medium text-slate-500">
          Page {{ page() }} of {{ totalPages() }}
        </span>
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          (click)="pageChange.emit(page() + 1)"
          [disabled]="page() >= totalPages()"
        >
          Next
        </button>
      </div>
    </nav>
  `,
})
export class Pagination {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();

  readonly pageChange = output<number>();

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );

  protected readonly firstRow = computed(() => (this.page() - 1) * this.pageSize() + 1);
  protected readonly lastRow = computed(() =>
    Math.min(this.page() * this.pageSize(), this.total()),
  );
}
