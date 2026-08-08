import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { Alert } from '../../../shared/ui/alert/alert';
import { Badge } from '../../../shared/ui/badge/badge';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import type { PaymentMethodRecord } from '../financial.models';
import { FinancialService } from '../financial.service';

@Component({
  selector: 'app-payment-methods',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, Alert, Badge, EmptyState, Spinner],
  templateUrl: './payment-methods.html',
})
export class PaymentMethods {
  private readonly financial = inject(FinancialService);

  protected readonly result = rxResource({ stream: () => this.financial.loadPaymentMethods() });

  /** `value()` throws while the resource is in an error state — gate every read. */
  private readonly loaded = computed(() => (this.result.hasValue() ? this.result.value() : null));

  protected readonly rows = computed(() => this.loaded()?.rows ?? []);
  protected readonly isDemoData = computed(() => this.loaded()?.isDemoData ?? false);
  protected readonly activeCount = computed(
    () => this.rows().filter((method) => !method.blocked).length,
  );

  protected readonly errorMessage = computed(() => {
    const error = this.result.error();
    return error instanceof Error
      ? error.message
      : error
        ? 'Could not load payment methods.'
        : null;
  });

  protected settlement(method: PaymentMethodRecord): string {
    if (method.releaseDeadline <= 0) {
      return 'Same day';
    }
    return method.releaseDeadline === 1 ? 'Next day' : `${method.releaseDeadline} days`;
  }

  protected reload(): void {
    this.result.reload();
  }
}
