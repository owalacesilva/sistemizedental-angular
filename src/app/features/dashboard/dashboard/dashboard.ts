import { DecimalPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { AuthService } from '../../../core/auth/auth.service';
import { Alert } from '../../../shared/ui/alert/alert';
import { Avatar } from '../../../shared/ui/avatar/avatar';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import { StatCard } from '../components/stat-card/stat-card';
import type { AppointmentStatus } from '../dashboard.models';
import { DashboardService } from '../dashboard.service';

const ICONS = {
  calendar:
    'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  users:
    'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  money:
    'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  gauge: 'M13 10V3L4 14h7v7l9-11h-7z',
} as const;

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  canceled: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, PercentPipe, StatCard, Alert, Avatar, Spinner],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly dashboard = inject(DashboardService);
  private readonly auth = inject(AuthService);

  protected readonly icons = ICONS;
  protected readonly firstName = computed(() => this.auth.displayName().split(' ')[0] || 'there');

  protected readonly data = rxResource({ stream: () => this.dashboard.load() });

  /** `value()` throws while the resource is in an error state — gate every read. */
  private readonly loaded = computed(() => (this.data.hasValue() ? this.data.value() : null));

  protected readonly metrics = computed(() => this.loaded()?.metrics ?? null);
  protected readonly appointments = computed(() => this.loaded()?.appointments ?? []);
  protected readonly patients = computed(() => this.loaded()?.patients ?? []);
  protected readonly isDemoData = computed(() => this.loaded()?.isDemoData ?? false);

  protected readonly errorMessage = computed(() => {
    const error = this.data.error();
    return error instanceof Error ? error.message : error ? 'Could not load dashboard data.' : null;
  });

  protected readonly today = new Date();

  protected statusClass(status: AppointmentStatus): string {
    return STATUS_STYLES[status];
  }

  protected time(iso: string): string {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  protected relativeDay(iso: string | null): string {
    if (!iso) {
      return 'No visits yet';
    }

    const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
    if (days <= 0) {
      return 'Today';
    }
    if (days === 1) {
      return 'Yesterday';
    }
    if (days < 30) {
      return `${days} days ago`;
    }

    const months = Math.round(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  protected reload(): void {
    this.data.reload();
  }
}
