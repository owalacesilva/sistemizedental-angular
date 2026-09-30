import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { injectLocale, injectT } from '../../../core/i18n/translate';
import type { MessageKey } from '../../../core/i18n/messages.en';
import { injectRelativeDay } from '../../../shared/format/relative-day';
import { Alert } from '../../../shared/ui/alert/alert';
import { Avatar } from '../../../shared/ui/avatar/avatar';
import { Badge, type BadgeTone } from '../../../shared/ui/badge/badge';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import type { PatientAnamnesis } from '../patients.models';
import { PatientsService } from '../patients.service';

interface AnamnesisGroup {
  readonly key: string;
  readonly labelKey: MessageKey;
  readonly items: readonly string[];
  readonly tone: BadgeTone;
}

@Component({
  selector: 'app-patient-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, Alert, Avatar, Badge, EmptyState, Spinner],
  templateUrl: './patient-detail.html',
})
export class PatientDetail {
  private readonly patients = inject(PatientsService);

  /** Bound from the `:id` route param by `withComponentInputBinding()`. */
  readonly id = input.required<string>();

  protected readonly t = injectT();
  protected readonly locale = injectLocale();
  protected readonly relativeDay = injectRelativeDay();

  protected readonly result = rxResource({
    params: () => Number(this.id()),
    stream: ({ params }) => this.patients.get(params),
  });

  /** `value()` throws while the resource is in an error state — gate every read. */
  protected readonly patient = computed(() =>
    this.result.hasValue() ? (this.result.value() ?? null) : null,
  );

  protected readonly errorMessage = computed(() => {
    const error = this.result.error();
    return error instanceof Error ? error.message : error ? this.t('patients.error') : null;
  });

  protected readonly address = computed(() => {
    const patient = this.patient();
    if (!patient) {
      return null;
    }
    const place = [patient.city, patient.state].filter(Boolean).join(' – ');
    return [patient.neighborhood, place].filter(Boolean).join(' · ') || null;
  });

  /** The three list-shaped parts of the anamnesis, in display order. */
  protected anamnesisGroups(anamnesis: PatientAnamnesis): readonly AnamnesisGroup[] {
    return [
      {
        key: 'allergies',
        labelKey: 'patients.anamnesis.allergies',
        items: anamnesis.allergies,
        tone: 'danger',
      },
      {
        key: 'medications',
        labelKey: 'patients.anamnesis.medications',
        items: anamnesis.medications,
        tone: 'info',
      },
      {
        key: 'conditions',
        labelKey: 'patients.anamnesis.conditions',
        items: anamnesis.conditions,
        tone: 'warning',
      },
    ];
  }
}
