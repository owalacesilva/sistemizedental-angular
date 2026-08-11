import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { injectLocale, injectT } from '../../../core/i18n/translate';
import { paginate } from '../../../shared/collections/paginate';
import { Alert } from '../../../shared/ui/alert/alert';
import { Badge } from '../../../shared/ui/badge/badge';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { Pagination } from '../../../shared/ui/pagination/pagination';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import type { PaymentMethodRecord } from '../financial.models';
import { FinancialService } from '../financial.service';

const DEFAULT_PAGE_SIZE = 10;

@Component({
  selector: 'app-payment-methods',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, Alert, Badge, EmptyState, Pagination, Spinner],
  templateUrl: './payment-methods.html',
})
export class PaymentMethods {
  private readonly financial = inject(FinancialService);

  protected readonly t = injectT();
  protected readonly locale = injectLocale();

  protected readonly pageSize = signal(DEFAULT_PAGE_SIZE);

  protected readonly result = rxResource({ stream: () => this.financial.loadPaymentMethods() });

  /** `value()` throws while the resource is in an error state — gate every read. */
  private readonly loaded = computed(() => (this.result.hasValue() ? this.result.value() : null));

  protected readonly all = computed(() => this.loaded()?.rows ?? []);
  protected readonly total = computed(() => this.all().length);
  protected readonly isDemoData = computed(() => this.loaded()?.isDemoData ?? false);
  protected readonly activeCount = computed(
    () => this.all().filter((method) => !method.blocked).length,
  );

  /** The endpoint hands back the whole list, so paging happens here. */
  protected readonly page = linkedSignal<string, number>({
    source: () => `${this.total()}:${this.pageSize()}`,
    computation: () => 1,
  });

  protected readonly rows = computed(() => paginate(this.all(), this.page(), this.pageSize()).rows);

  protected readonly errorMessage = computed(() => {
    const error = this.result.error();
    return error instanceof Error ? error.message : error ? this.t('paymentMethods.error') : null;
  });

  protected settlement(method: PaymentMethodRecord): string {
    if (method.releaseDeadline <= 0) {
      return this.t('paymentMethods.settlementSameDay');
    }
    return method.releaseDeadline === 1
      ? this.t('paymentMethods.settlementNextDay')
      : this.t('paymentMethods.settlementDays', { count: method.releaseDeadline });
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
