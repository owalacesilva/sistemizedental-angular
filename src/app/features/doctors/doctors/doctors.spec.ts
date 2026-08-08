import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import type { DoctorsList } from '../doctors.models';
import { DoctorsService } from '../doctors.service';
import { Doctors } from './doctors';

const TEAM: DoctorsList = {
  isDemoData: false,
  rows: [
    {
      id: 11,
      name: 'Dr. Alex Moreira',
      email: 'alex.moreira@sistemizedental.com',
      phone: '+55 11 98111-2233',
      birthDate: '1980-04-18',
      blocked: false,
      workingDays: [1, 2, 3, 4, 5],
    },
    {
      id: 15,
      name: 'Dr. Eduardo Ramalho',
      email: null,
      phone: null,
      birthDate: null,
      blocked: true,
      workingDays: [],
    },
  ],
};

async function render(service: Partial<DoctorsService>): Promise<ComponentFixture<Doctors>> {
  await TestBed.configureTestingModule({
    imports: [Doctors],
    providers: [{ provide: DoctorsService, useValue: service }],
  }).compileComponents();

  const fixture = TestBed.createComponent(Doctors);
  await fixture.whenStable();
  return fixture;
}

/** The search box debounces on a real timer, which `whenStable()` does not await. */
async function afterDebounce(fixture: ComponentFixture<Doctors>): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  await fixture.whenStable();
}

describe('Doctors', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('lists the whole team with a status per doctor', async () => {
    const fixture = await render({ list: () => of(TEAM) });
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Dr. Alex Moreira');
    expect(text).toContain('Dr. Eduardo Ramalho');
    expect(text).toContain('Active');
    expect(text).toContain('Blocked');
    expect(text).toContain('2 on the team');
  });

  it('says when a doctor has no working hours', async () => {
    const fixture = await render({ list: () => of(TEAM) });

    expect(fixture.nativeElement.textContent).toContain('No working hours configured.');
  });

  it('filters down to blocked doctors', async () => {
    const fixture = await render({ list: () => of(TEAM) });

    fixture.componentInstance['setFilter']('blocked');
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Dr. Eduardo Ramalho');
    expect(text).not.toContain('Dr. Alex Moreira');
  });

  it('searches by email as well as name', async () => {
    const fixture = await render({ list: () => of(TEAM) });

    fixture.componentInstance['searchControl'].setValue('alex.moreira@');
    await afterDebounce(fixture);

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Dr. Alex Moreira');
    expect(text).not.toContain('Dr. Eduardo Ramalho');
  });

  it('flags sample data when the demo backend answered', async () => {
    const fixture = await render({ list: () => of({ ...TEAM, isDemoData: true }) });

    expect(fixture.nativeElement.textContent).toContain('Showing a sample team');
  });

  it('surfaces a load failure', async () => {
    const fixture = await render({
      list: () => throwError(() => new Error('Service unavailable.')),
    });

    expect(fixture.nativeElement.textContent).toContain('Service unavailable.');
  });
});
