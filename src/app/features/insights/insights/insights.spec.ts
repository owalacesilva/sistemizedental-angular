import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { type Observable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { I18nService } from '../../../core/i18n/i18n.service';
import type { InsightsData, InsightsPeriod, Kpi } from '../insights.models';
import { InsightsService } from '../insights.service';
import { Insights } from './insights';

function kpi(current: number, previous: number, series: readonly number[]): Kpi {
  return { current, previous, series };
}

const DATA: InsightsData = {
  revenue: kpi(12_000, 10_000, [2000, 4000, 3000, 3000]),
  expenses: kpi(4000, 5000, [1000, 1000, 1000, 1000]),
  balance: kpi(8000, 5000, [1000, 3000, 2000, 2000]),
  appointments: kpi(40, 40, [10, 10, 10, 10]),
  averageTicket: kpi(300, 250, [250, 400, 300, 300]),
  noShowRate: kpi(0.05, 0.1, [0.1, 0.05, 0.05, 0.02]),
  granularity: 'week',
  trend: [
    { startIso: '2026-07-13', revenue: 2000, expenses: 1000 },
    { startIso: '2026-07-20', revenue: 4000, expenses: 1000 },
    { startIso: '2026-07-27', revenue: 3000, expenses: 1000 },
    { startIso: '2026-08-03', revenue: 3000, expenses: 1000 },
  ],
  outcomes: [
    { key: 'completed', label: '', value: 30 },
    { key: 'booked', label: '', value: 6 },
    { key: 'missed', label: '', value: 2 },
    { key: 'canceled', label: '', value: 2 },
  ],
  procedures: [
    { key: 'Crown fitting', label: 'Crown fitting', value: 6000 },
    { key: 'Routine cleaning', label: 'Routine cleaning', value: 3000 },
  ],
  payments: [
    { key: 'Credit card', label: 'Credit card', value: 9000 },
    { key: 'Pix', label: 'Pix', value: 3000 },
  ],
  hours: [
    { weekday: 1, hour: 9, count: 8 },
    { weekday: 3, hour: 14, count: 4 },
  ],
  busiestHourCount: 8,
  isDemoData: false,
};

const EMPTY: InsightsData = {
  ...DATA,
  revenue: kpi(0, 0, [0]),
  expenses: kpi(0, 0, [0]),
  balance: kpi(0, 0, [0]),
  appointments: kpi(0, 0, [0]),
  averageTicket: kpi(0, 0, [0]),
  noShowRate: kpi(0, 0, [0]),
  trend: [{ startIso: '2026-08-03', revenue: 0, expenses: 0 }],
  outcomes: [],
  procedures: [],
  payments: [],
  hours: [],
  busiestHourCount: 0,
};

async function render(service: Partial<InsightsService>): Promise<ComponentFixture<Insights>> {
  await TestBed.configureTestingModule({
    imports: [Insights],
    providers: [{ provide: InsightsService, useValue: service }],
  }).compileComponents();

  const fixture = TestBed.createComponent(Insights);
  await fixture.whenStable();
  return fixture;
}

function root(fixture: ComponentFixture<Insights>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

describe('Insights', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('leads with six headline numbers', async () => {
    const fixture = await render({ load: () => of(DATA) });
    const text = root(fixture).textContent ?? '';

    expect(root(fixture).querySelectorAll('app-kpi-tile')).toHaveLength(6);
    for (const label of [
      'Revenue',
      'Expenses',
      'Net balance',
      'Appointments',
      'Average ticket',
      'No-show rate',
    ]) {
      expect(text).toContain(label);
    }
  });

  it('reads a fall in expenses as good news and a fall in revenue as bad', async () => {
    const fixture = await render({ load: () => of(DATA) });
    const tiles = [...root(fixture).querySelectorAll('app-kpi-tile')];

    // Revenue rose 20%: up, and up is good.
    expect(tiles[0].textContent).toContain('▲ 20%');
    expect(tiles[0].querySelector('.text-emerald-600')).not.toBeNull();

    // Expenses fell 20%: down, and down is good.
    expect(tiles[1].textContent).toContain('▼ 20%');
    expect(tiles[1].querySelector('.text-emerald-600')).not.toBeNull();
  });

  it('says so rather than inventing a delta with nothing to compare against', async () => {
    const fixture = await render({
      load: () => of({ ...DATA, revenue: kpi(500, 0, [500]) }),
    });

    expect(root(fixture).textContent).toContain('no earlier data');
  });

  it('draws a column pair per bucket, scaled to the tallest', async () => {
    const fixture = await render({ load: () => of(DATA) });
    const chart = root(fixture).querySelector('app-column-chart') as HTMLElement;
    const bars = [...chart.querySelectorAll<HTMLElement>('[style*="height"]')];

    expect(bars).toHaveLength(8);
    // The 4000 revenue bucket is the tallest, so it fills the plot.
    expect(bars.map((bar) => bar.style.height)).toContain('100%');
    // 1000 of 4000 is a quarter.
    expect(bars.map((bar) => bar.style.height)).toContain('25%');
  });

  it('labels the trend axis in money and both series in the legend', async () => {
    const fixture = await render({ load: () => of(DATA) });
    const chart = root(fixture).querySelector('app-column-chart')?.textContent ?? '';

    expect(chart).toContain('4k');
    expect(chart).toContain('Revenue');
    expect(chart).toContain('Expenses');
    expect(chart).toContain('R$ 12,000');
  });

  it('gives every share bar segment a width, a value and a percentage', async () => {
    const fixture = await render({ load: () => of(DATA) });
    const bar = root(fixture).querySelector('app-share-bar') as HTMLElement;
    const segments = [...bar.querySelectorAll<HTMLElement>('[style*="width"]')];

    expect(segments).toHaveLength(4);
    expect(segments[0].style.width).toBe('75%');
    expect(bar.textContent).toContain('Completed');
    expect(bar.textContent).toContain('75%');
    expect(bar.textContent).toContain('No-show');
  });

  it('paints each share segment its own slot colour, in order', async () => {
    const fixture = await render({ load: () => of(DATA) });
    const bar = root(fixture).querySelector('app-share-bar') as HTMLElement;
    const segments = [...bar.querySelectorAll<HTMLElement>('[style*="width"]')];

    expect(segments.map((segment) => segment.className)).toEqual([
      expect.stringContaining('bg-chart-1'),
      expect.stringContaining('bg-chart-2'),
      expect.stringContaining('bg-chart-3'),
      expect.stringContaining('bg-chart-4'),
    ]);
  });

  it('ranks procedures against the biggest, in one hue', async () => {
    const fixture = await render({ load: () => of(DATA) });
    const bars = root(fixture).querySelector('app-ranked-bars') as HTMLElement;
    const fills = [...bars.querySelectorAll<HTMLElement>('[style*="width"]')];

    expect(fills.map((fill) => fill.style.width)).toEqual(['100%', '50%']);
    expect(fills.every((fill) => fill.className.includes('bg-chart-1'))).toBe(true);
    expect(bars.textContent).toContain('Crown fitting');
  });

  it('plots the whole week against the clinic hours', async () => {
    const fixture = await render({ load: () => of(DATA) });
    const grid = root(fixture).querySelector('app-heat-grid') as HTMLElement;

    // 7 weekdays × 14 hours, plus the row and column headers.
    expect(grid.querySelectorAll('[title]')).toHaveLength(98);
    expect(grid.textContent).toContain('Mon');
    expect(grid.textContent).toContain('Quieter');
  });

  it('shades a busy cell darker than a quiet one, and an empty one neutral', async () => {
    const fixture = await render({ load: () => of(DATA) });
    const grid = root(fixture).querySelector('app-heat-grid') as HTMLElement;

    const busiest = grid.querySelector('[title*="Monday at 09:00"]');
    const middling = grid.querySelector('[title*="Wednesday at 14:00"]');
    const empty = grid.querySelector('[title*="Sunday at 07:00"]');

    expect(busiest?.className).toContain('bg-brand-700');
    expect(middling?.className).toContain('bg-brand-300');
    expect(empty?.className).toContain('bg-slate-100');
    expect(empty?.getAttribute('title')).toContain('0 booked');
  });

  it('re-queries when the period changes', async () => {
    const load = vi.fn<(period: InsightsPeriod) => Observable<InsightsData>>(() => of(DATA));
    const fixture = await render({ load });

    fixture.componentInstance['selectPeriod']('year');
    await fixture.whenStable();

    expect(load).toHaveBeenLastCalledWith('year');
  });

  it('formats every number in the chosen language', async () => {
    const fixture = await render({ load: () => of(DATA) });
    expect(root(fixture).textContent).toContain('R$ 12,000');

    TestBed.inject(I18nService).use('pt-BR');
    await fixture.whenStable();

    // pt-BR's currency pattern separates symbol and number with U+00A0, so a
    // single regular space here is exactly the doubled-space bug to watch for.
    const text = (root(fixture).textContent ?? '').replace(/\u00a0/g, ' ');
    expect(text).toContain('R$ 12.000');
    expect(text).not.toContain('R$  12.000');
    expect(text).toContain('Indicadores');
    expect(text).toContain('Concluídos');
  });

  it('says each panel is empty rather than drawing an empty chart', async () => {
    const fixture = await render({ load: () => of(EMPTY) });
    const text = root(fixture).textContent ?? '';

    expect(text).toContain('No movements in this window yet');
    expect(text).toContain('No appointments in this window yet');
    expect(text).toContain('No billed procedures in this window yet');
    expect(text).toContain('Not enough bookings to plot a pattern yet');
  });

  it('flags sample analytics when the demo backend answered', async () => {
    const fixture = await render({ load: () => of({ ...DATA, isDemoData: true }) });

    expect(root(fixture).textContent).toContain('Showing sample analytics');
  });

  it('surfaces a load failure', async () => {
    const fixture = await render({
      load: () => throwError(() => new Error('Service unavailable.')),
    });

    expect(root(fixture).textContent).toContain('Service unavailable.');
  });
});
