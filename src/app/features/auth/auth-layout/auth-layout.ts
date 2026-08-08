import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Logo } from '../../../shared/ui/logo/logo';

@Component({
  selector: 'app-auth-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Logo],
  templateUrl: './auth-layout.html',
})
export class AuthLayout {
  readonly heading = input.required<string>();
  readonly subheading = input.required<string>();

  protected readonly year = new Date().getFullYear();
  protected readonly features = [
    'Smart scheduling with conflict detection',
    'Complete patient and anamnesis records',
    'Treatment plans, budgets and receivables',
    'Clear financial reporting for every chair',
  ];
}
