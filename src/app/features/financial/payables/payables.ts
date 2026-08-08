import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { toIsoDate } from '../../../shared/format/dates';
import { Alert } from '../../../shared/ui/alert/alert';
import { Badge, type BadgeTone } from '../../../shared/ui/badge/badge';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import type { PayableRecord } from '../financial.models';
import { FinancialService } from '../financial.service';

@Component({
  selector: 'app-payables',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, Alert, Badge, EmptyState, Spinner],
  templateUrl: './payables.html',
})
export class Payables {
  private readonly financial = inject(FinancialService);

  private readonly today = toIsoDate(new Date());

  protected readonly result = rxResource({ stream: () => this.financial.loadPayables() });

  /** `value()` throws while the resource is in an error state — gate every read. */
  private readonly loaded = computed(() => (this.result.hasValue() ? this.result.value() : null));

  protected readonly rows = computed(() => this.loaded()?.rows ?? []);
  protected readonly outstanding = computed(() => this.loaded()?.outstanding ?? 0);
  protected readonly overdue = computed(() => this.loaded()?.overdue ?? 0);
  protected readonly isDemoData = computed(() => this.loaded()?.isDemoData ?? false);

  protected readonly errorMessage = computed(() => {
    const error = this.result.error();
    return error instanceof Error ? error.message : error ? 'Could not load the bills.' : null;
  });

  protected isOverdue(bill: PayableRecord): boolean {
    return !bill.paid && bill.dueDate < this.today;
  }

  protected statusLabel(bill: PayableRecord): string {
    if (bill.paid) {
      return 'Paid';
    }
    return this.isOverdue(bill) ? 'Overdue' : 'Scheduled';
  }

  protected statusTone(bill: PayableRecord): BadgeTone {
    if (bill.paid) {
      return 'success';
    }
    return this.isOverdue(bill) ? 'danger' : 'warning';
  }

  protected reload(): void {
    this.result.reload();
  }
}
