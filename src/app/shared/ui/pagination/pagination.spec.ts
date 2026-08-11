import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { Pagination } from './pagination';

@Component({
  selector: 'app-pagination-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Pagination],
  template: `
    <app-pagination
      [page]="page()"
      [pageSize]="pageSize()"
      [total]="total()"
      (pageChange)="page.set($event)"
      (pageSizeChange)="pageSize.set($event)"
    />
  `,
})
class Host {
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly total = signal(24);
}

async function render(): Promise<ComponentFixture<Host>> {
  await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  return fixture;
}

function numbers(fixture: ComponentFixture<Host>): string[] {
  return [
    ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
      '[aria-label^="Go to page"]',
    ),
  ].map((button) => button.textContent?.trim() ?? '');
}

describe('Pagination', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('says which rows are on screen', async () => {
    const fixture = await render();

    expect(fixture.nativeElement.textContent).toContain('Showing 1–10 of 24');
    expect(fixture.nativeElement.textContent).toContain('Page 1 of 3');
  });

  it('reports no records rather than a zero range', async () => {
    const fixture = await render();
    fixture.componentInstance.total.set(0);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('No records');
  });

  it('lists every page while they all fit', async () => {
    const fixture = await render();

    expect(numbers(fixture)).toEqual(['1', '2', '3']);
  });

  it('elides the middle of a long run, keeping the ends and the cursor', async () => {
    const fixture = await render();
    fixture.componentInstance.total.set(200);
    fixture.componentInstance.page.set(10);
    await fixture.whenStable();

    expect(numbers(fixture)).toEqual(['1', '9', '10', '11', '20']);
    expect(fixture.nativeElement.textContent).toContain('…');
  });

  it('marks the current page for assistive tech', async () => {
    const fixture = await render();
    fixture.componentInstance.page.set(2);
    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('[aria-current="page"]')
        ?.textContent?.trim(),
    ).toBe('2');
  });

  it('stops at the first and last page', async () => {
    const fixture = await render();
    const [previous, next] = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
    ].filter((button) => /Previous|Next/.test(button.textContent ?? ''));

    expect(previous.disabled).toBe(true);

    fixture.componentInstance.page.set(3);
    await fixture.whenStable();
    expect(next.disabled).toBe(true);
  });

  it('walks to the next page', async () => {
    const fixture = await render();

    [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Next'))
      ?.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.page()).toBe(2);
  });

  it('changes the page size', async () => {
    const fixture = await render();
    const select = (fixture.nativeElement as HTMLElement).querySelector(
      'select',
    ) as HTMLSelectElement;

    select.value = '50';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(fixture.componentInstance.pageSize()).toBe(50);
  });
});
