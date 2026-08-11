import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { injectLocale, injectPlural, injectT } from '../../../core/i18n/translate';
import { paginate } from '../../../shared/collections/paginate';
import { toIsoDate } from '../../../shared/format/dates';
import { injectMoney } from '../../../shared/format/money';
import { Alert } from '../../../shared/ui/alert/alert';
import { Badge, type BadgeTone } from '../../../shared/ui/badge/badge';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { Pagination } from '../../../shared/ui/pagination/pagination';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import type { PayableRecord } from '../financial.models';
import { FinancialService } from '../financial.service';

const DEFAULT_PAGE_SIZE = 10;

@Component({
  selector: 'app-payables',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, Alert, Badge, EmptyState, Pagination, Spinner],
  templateUrl: './payables.html',
})
export class Payables {
  private readonly financial = inject(FinancialService);

  private readonly today = toIsoDate(new Date());

  protected readonly t = injectT();
  protected readonly plural = injectPlural();
  protected readonly locale = injectLocale();
  protected readonly money = injectMoney();

  protected readonly pageSize = signal(DEFAULT_PAGE_SIZE);

  protected readonly result = rxResource({ stream: () => this.financial.loadPayables() });

  /** `value()` throws while the resource is in an error state — gate every read. */
  private readonly loaded = computed(() => (this.result.hasValue() ? this.result.value() : null));

  protected readonly all = computed(() => this.loaded()?.rows ?? []);
  protected readonly total = computed(() => this.all().length);
  protected readonly outstanding = computed(() => this.loaded()?.outstanding ?? 0);
  protected readonly overdue = computed(() => this.loaded()?.overdue ?? 0);
  protected readonly isDemoData = computed(() => this.loaded()?.isDemoData ?? false);

  /** The endpoint hands back the whole list, so paging happens here. */
  protected readonly page = linkedSignal<string, number>({
    source: () => `${this.total()}:${this.pageSize()}`,
    computation: () => 1,
  });

  protected readonly rows = computed(() => paginate(this.all(), this.page(), this.pageSize()).rows);

  protected readonly errorMessage = computed(() => {
    const error = this.result.error();
    return error instanceof Error ? error.message : error ? this.t('payables.error') : null;
  });

  protected isOverdue(bill: PayableRecord): boolean {
    return !bill.paid && bill.dueDate < this.today;
  }

  protected statusLabel(bill: PayableRecord): string {
    if (bill.paid) {
      return this.t('payables.status.paid');
    }
    return this.isOverdue(bill)
      ? this.t('payables.status.overdue')
      : this.t('payables.status.scheduled');
  }

  protected statusTone(bill: PayableRecord): BadgeTone {
    if (bill.paid) {
      return 'success';
    }
    return this.isOverdue(bill) ? 'danger' : 'warning';
  }

  protected goToPage(page: number): void {
    this.page.set(page);
  }

  protected setPageSize(size: number): void {
    this.pageSize.set(size);
  }

  protected reload(): void {
    this.result.reload();
  }
}
