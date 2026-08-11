import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from '../../../core/auth/auth.service';
import type { DashboardData } from '../dashboard.models';
import { DashboardService } from '../dashboard.service';
import { Dashboard } from './dashboard';

const DATA: DashboardData = {
  isDemoData: false,
  metrics: {
    appointmentsToday: 14,
    newPatientsThisMonth: 38,
    revenueThisMonth: 48250,
    chairOccupancy: 0.82,
  },
  appointments: [
    {
      id: 1,
      patientName: 'Marina Alves',
      doctorName: 'Dr. Alex Moreira',
      startsAt: new Date().toISOString(),
      procedure: 'Routine cleaning',
      status: 'confirmed',
    },
  ],
  patients: [{ id: 101, name: 'Marina Alves', lastVisit: null, phone: '+55 11 98123-4455' }],
};

async function render(service: Partial<DashboardService>): Promise<ComponentFixture<Dashboard>> {
  await TestBed.configureTestingModule({
    imports: [Dashboard],
    providers: [
      provideRouter([]),
      { provide: DashboardService, useValue: service },
      {
        provide: AuthService,
        useValue: { displayName: () => 'Alex Moreira', account: () => null },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(Dashboard);
  await fixture.whenStable();
  return fixture;
}

describe('Dashboard', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('greets the signed-in user by first name', async () => {
    const fixture = await render({ load: () => of(DATA) });

    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Alex');
  });

  it('renders the four headline metrics', async () => {
    const fixture = await render({ load: () => of(DATA) });
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Appointments today');
    expect(text).toContain('14');
    expect(text).toContain('48,250');
    expect(text).toContain('82%');
  });

  it("lists today's appointments", async () => {
    const fixture = await render({ load: () => of(DATA) });
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Marina Alves');
    expect(text).toContain('Routine cleaning');
    expect(text).toContain('Confirmed');
  });

  it('shows an empty state when nothing is booked', async () => {
    const fixture = await render({
      load: () => of({ ...DATA, appointments: [] }),
    });

    expect(fixture.nativeElement.textContent).toContain('Nothing booked yet');
  });

  it('flags sample data when the demo backend answered', async () => {
    const fixture = await render({ load: () => of({ ...DATA, isDemoData: true }) });

    expect(fixture.nativeElement.textContent).toContain('Showing sample data');
  });

  it('surfaces a load failure', async () => {
    const fixture = await render({
      load: () => throwError(() => new Error('Service unavailable.')),
    });

    expect(fixture.nativeElement.textContent).toContain('Service unavailable.');
  });
});
