import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { type Observable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PatientsPage, PatientsQuery } from '../patients.models';
import { PatientsService } from '../patients.service';
import { Patients } from './patients';

const PAGE: PatientsPage = {
  isDemoData: false,
  total: 24,
  rows: [
    {
      id: 101,
      name: 'Marina Alves',
      phone: '+55 11 98123-4455',
      email: 'marina.alves@example.com',
      neighborhood: 'Pinheiros',
      city: 'São Paulo',
      state: 'SP',
      birthDate: '1991-03-14',
      lastVisit: null,
      active: true,
    },
    {
      id: 108,
      name: 'Lucas Prado',
      phone: null,
      email: null,
      neighborhood: null,
      city: null,
      state: null,
      birthDate: null,
      lastVisit: null,
      active: false,
    },
  ],
};

async function render(service: Partial<PatientsService>): Promise<ComponentFixture<Patients>> {
  await TestBed.configureTestingModule({
    imports: [Patients],
    providers: [{ provide: PatientsService, useValue: service }],
  }).compileComponents();

  const fixture = TestBed.createComponent(Patients);
  await fixture.whenStable();
  return fixture;
}

/** The search box debounces on a real timer, which `whenStable()` does not await. */
async function afterDebounce(fixture: ComponentFixture<Patients>): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  await fixture.whenStable();
}

describe('Patients', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('lists the page of patients', async () => {
    const fixture = await render({ list: () => of(PAGE) });
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Marina Alves');
    expect(text).toContain('Pinheiros · São Paulo – SP');
    expect(text).toContain('24 patients');
  });

  it('marks an inactive patient and its missing contact', async () => {
    const fixture = await render({ list: () => of(PAGE) });
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Inactive');
    expect(text).toContain('No contact on file');
  });

  it('reports how much of the total is on screen', async () => {
    const fixture = await render({ list: () => of(PAGE) });

    expect(fixture.nativeElement.textContent).toContain('Showing 1–10 of 24');
    expect(fixture.nativeElement.textContent).toContain('Page 1 of 3');
  });

  it('asks the service for the next page', async () => {
    const list = vi.fn<(query: PatientsQuery) => Observable<PatientsPage>>(() => of(PAGE));
    const fixture = await render({ list });

    fixture.componentInstance['goToPage'](2);
    await fixture.whenStable();

    expect(list).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
  });

  it('offers a way out of a search with no matches', async () => {
    const fixture = await render({ list: () => of({ ...PAGE, rows: [], total: 0 }) });

    fixture.componentInstance['searchControl'].setValue('zzz');
    await afterDebounce(fixture);

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('No patients match that search');
    expect(text).toContain('Clear search');
  });

  it('flags sample data when the demo backend answered', async () => {
    const fixture = await render({ list: () => of({ ...PAGE, isDemoData: true }) });

    expect(fixture.nativeElement.textContent).toContain('Showing sample records');
  });

  it('surfaces a load failure', async () => {
    const fixture = await render({
      list: () => throwError(() => new Error('Service unavailable.')),
    });

    expect(fixture.nativeElement.textContent).toContain('Service unavailable.');
  });
});
