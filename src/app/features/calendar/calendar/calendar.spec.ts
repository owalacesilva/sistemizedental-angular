import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import type { Schedule } from '../calendar.models';
import { CalendarService } from '../calendar.service';
import { Calendar } from './calendar';

function todayAt(hour: number, minute = 0): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

const SCHEDULE: Schedule = {
  isDemoData: false,
  doctors: [
    { id: 11, name: 'Dr. Alex Moreira' },
    { id: 12, name: 'Dr. Bianca Lima' },
  ],
  events: [
    {
      id: 1,
      patientName: 'Marina Alves',
      doctorId: 11,
      doctorName: 'Dr. Alex Moreira',
      procedure: 'Routine cleaning',
      status: 'confirmed',
      startsAt: todayAt(9),
      endsAt: todayAt(10),
    },
    {
      id: 2,
      patientName: 'Rafael Costa',
      doctorId: 12,
      doctorName: 'Dr. Bianca Lima',
      procedure: 'Root canal',
      status: 'created',
      startsAt: todayAt(11),
      endsAt: todayAt(12),
    },
  ],
};

async function render(service: Partial<CalendarService>): Promise<ComponentFixture<Calendar>> {
  await TestBed.configureTestingModule({
    imports: [Calendar],
    providers: [{ provide: CalendarService, useValue: service }],
  }).compileComponents();

  const fixture = TestBed.createComponent(Calendar);
  await fixture.whenStable();
  return fixture;
}

describe('Calendar', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('opens on the current week', async () => {
    const fixture = await render({ load: () => of(SCHEDULE) });

    // Monday through Sunday, in both the header row and the grid.
    expect(
      fixture.nativeElement.querySelectorAll('[aria-label="Agenda"] .grid-cols-7').length,
    ).toBe(2);
  });

  it('places every appointment in the grid', async () => {
    const fixture = await render({ load: () => of(SCHEDULE) });
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Marina Alves');
    expect(text).toContain('Rafael Costa');
    expect(text).toContain('2 booked');
    expect(text).toContain('1 confirmed');
  });

  it('narrows the agenda to one doctor', async () => {
    const fixture = await render({ load: () => of(SCHEDULE) });

    fixture.componentInstance['doctorId'].set(12);
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Rafael Costa');
    expect(text).not.toContain('Marina Alves');
  });

  it('switches to a single day column', async () => {
    const fixture = await render({ load: () => of(SCHEDULE) });

    fixture.componentInstance['setView']('day');
    await fixture.whenStable();

    expect(
      fixture.nativeElement.querySelectorAll('[aria-label="Agenda"] .grid-cols-1').length,
    ).toBe(2);
  });

  it('reports an empty period', async () => {
    const fixture = await render({ load: () => of({ ...SCHEDULE, events: [] }) });

    expect(fixture.nativeElement.textContent).toContain('No appointments in this period.');
  });

  it('flags sample data when the demo backend answered', async () => {
    const fixture = await render({ load: () => of({ ...SCHEDULE, isDemoData: true }) });

    expect(fixture.nativeElement.textContent).toContain('Showing a sample agenda');
  });

  it('surfaces a load failure', async () => {
    const fixture = await render({
      load: () => throwError(() => new Error('Service unavailable.')),
    });

    expect(fixture.nativeElement.textContent).toContain('Service unavailable.');
  });
});
