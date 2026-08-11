import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DoctorsService } from '../../features/doctors/doctors.service';
import { PatientsService } from '../../features/patients/patients.service';
import type { PatientsPage, PatientsQuery } from '../../features/patients/patients.models';
import type { DoctorsList } from '../../features/doctors/doctors.models';
import { LayoutStore } from '../layout.store';
import { GlobalSearch } from './global-search';
import { patientFieldFor } from './global-search.service';

const PATIENTS: PatientsPage = {
  isDemoData: false,
  total: 1,
  rows: [
    {
      id: 101,
      name: 'Marina Alves',
      phone: '+55 11 98123-4455',
      email: 'marina.alves@example.com',
      neighborhood: null,
      city: null,
      state: null,
      birthDate: null,
      lastVisit: null,
      active: true,
    },
  ],
};

const DOCTORS: DoctorsList = {
  isDemoData: false,
  rows: [
    {
      id: 11,
      name: 'Dr. Marina Prado',
      email: 'marina.prado@clinic.com',
      phone: null,
      birthDate: null,
      blocked: false,
      workingDays: [1, 2],
    },
  ],
};

interface Stubs {
  readonly list?: (query: PatientsQuery) => ReturnType<PatientsService['list']>;
  readonly doctors?: () => ReturnType<DoctorsService['list']>;
}

async function render(stubs: Stubs = {}): Promise<ComponentFixture<GlobalSearch>> {
  await TestBed.configureTestingModule({
    imports: [GlobalSearch],
    providers: [
      provideRouter([{ path: '**', children: [] }]),
      { provide: PatientsService, useValue: { list: stubs.list ?? (() => of(PATIENTS)) } },
      { provide: DoctorsService, useValue: { list: stubs.doctors ?? (() => of(DOCTORS)) } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(GlobalSearch);
  await fixture.whenStable();
  return fixture;
}

function press(key: string, options: KeyboardEventInit = {}): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }));
}

async function type(fixture: ComponentFixture<GlobalSearch>, value: string): Promise<void> {
  fixture.componentInstance['control'].setValue(value);
  // The remote half is debounced on a real timer, which `whenStable()` skips.
  await new Promise((resolve) => setTimeout(resolve, 260));
  await fixture.whenStable();
}

describe('GlobalSearch', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  afterEach(() => localStorage.clear());

  it('stays out of the way until it is asked for', async () => {
    const fixture = await render();

    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('opens on the keyboard shortcut and closes on Escape', async () => {
    const fixture = await render();

    press('k', { metaKey: true });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();

    press('Escape');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('offers destinations before anything is typed', async () => {
    const fixture = await render();
    TestBed.inject(LayoutStore).openSearch();
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Go to');
    expect(text).toContain('Patients');
    expect(text).toContain('Insights');
  });

  it('matches sub-pages by their section and name', async () => {
    const fixture = await render();
    TestBed.inject(LayoutStore).openSearch();
    await type(fixture, 'bills');

    expect(fixture.nativeElement.textContent).toContain('Financial · Bills to pay');
  });

  it('groups people from the API under their own headings', async () => {
    const fixture = await render();
    TestBed.inject(LayoutStore).openSearch();
    await type(fixture, 'marina');

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Marina Alves');
    expect(text).toContain('Dr. Marina Prado');
    expect(text).toContain('See all patients matching “marina”');
  });

  it('picks the search field from the shape of the term', () => {
    expect(patientFieldFor('marina')).toBe('first_name');
    expect(patientFieldFor('marina@example.com')).toBe('email');
    expect(patientFieldFor('11 98123-4455')).toBe('phone_number');
  });

  it('walks the results with the arrow keys and opens one with Enter', async () => {
    const fixture = await render();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    TestBed.inject(LayoutStore).openSearch();
    await type(fixture, 'marina');

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalled();
    expect(TestBed.inject(LayoutStore).isSearchOpen()).toBe(false);
  });

  it('says so when nothing matches', async () => {
    const fixture = await render({ list: () => of({ ...PATIENTS, rows: [], total: 0 }) });
    TestBed.inject(LayoutStore).openSearch();
    await type(fixture, 'zzzzz');

    expect(fixture.nativeElement.textContent).toContain('Nothing matches “zzzzz”');
  });

  it('keeps showing doctors when the patients endpoint fails', async () => {
    const fixture = await render({ list: () => throwError(() => new Error('boom')) });
    TestBed.inject(LayoutStore).openSearch();
    await type(fixture, 'marina');

    expect(fixture.nativeElement.textContent).toContain('Dr. Marina Prado');
  });

  it('remembers a term once it has been used', async () => {
    const fixture = await render();
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    TestBed.inject(LayoutStore).openSearch();
    await type(fixture, 'marina');

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();

    TestBed.inject(LayoutStore).openSearch();
    await type(fixture, '');

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Recent searches');
    expect(text).toContain('marina');
  });
});
