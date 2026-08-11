import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { I18nService } from '../../core/i18n/i18n.service';
import { LayoutStore } from '../layout.store';
import { Sidebar } from './sidebar';

async function render(url = '/dashboard'): Promise<ComponentFixture<Sidebar>> {
  await TestBed.configureTestingModule({
    imports: [Sidebar],
    providers: [provideRouter([{ path: '**', children: [] }])],
  }).compileComponents();

  const fixture = TestBed.createComponent(Sidebar);
  await TestBed.inject(Router).navigateByUrl(url);
  await fixture.whenStable();
  return fixture;
}

function links(fixture: ComponentFixture<Sidebar>): string[] {
  return [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('a, button')].map(
    (element) => element.textContent?.trim() ?? '',
  );
}

describe('Sidebar', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  afterEach(() => localStorage.clear());

  it('lists every top-level destination', async () => {
    const fixture = await render();
    const labels = links(fixture);

    for (const label of ['Dashboard', 'Insights', 'Calendar', 'Patients', 'Doctors']) {
      expect(labels).toContain(label);
    }
  });

  it('keeps a section folded until you are in it', async () => {
    const fixture = await render('/dashboard');

    expect(links(fixture)).not.toContain('Bills to pay');
  });

  it('unfolds the section the route is inside', async () => {
    const fixture = await render('/financial/payables');
    const labels = links(fixture);

    expect(labels).toContain('Statement');
    expect(labels).toContain('Transactions');
    expect(labels).toContain('Bills to pay');
    expect(labels).toContain('Payment methods');
  });

  it('marks the sub-item you are on', async () => {
    const fixture = await render('/financial/payables');

    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('[aria-current="page"]')
        ?.textContent?.trim(),
    ).toBe('Bills to pay');
  });

  it('opens and closes a section on demand', async () => {
    const fixture = await render('/dashboard');
    const settings = fixture.componentInstance['navItems'].find(
      (item) => item.route === '/settings',
    );

    fixture.componentInstance['toggleGroup'](settings!);
    await fixture.whenStable();
    expect(links(fixture)).toContain('Security');

    fixture.componentInstance['toggleGroup'](settings!);
    await fixture.whenStable();
    expect(links(fixture)).not.toContain('Security');
  });

  it('leaves a hand-opened section open when the route changes', async () => {
    const fixture = await render('/dashboard');
    const settings = fixture.componentInstance['navItems'].find(
      (item) => item.route === '/settings',
    );

    fixture.componentInstance['toggleGroup'](settings!);
    await TestBed.inject(Router).navigateByUrl('/patients');
    await fixture.whenStable();

    expect(links(fixture)).toContain('Security');
  });

  it('collapses to a rail, hiding the labels but not the links', async () => {
    const fixture = await render('/dashboard');

    TestBed.inject(LayoutStore).toggleSidebarCollapsed();
    await fixture.whenStable();

    expect(links(fixture)).not.toContain('Patients');
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('a[href="/patients"]')
        ?.getAttribute('title'),
    ).toBe('Patients');
  });

  it('remembers the collapsed rail across a reload', async () => {
    const fixture = await render('/dashboard');
    TestBed.inject(LayoutStore).toggleSidebarCollapsed();
    await fixture.whenStable();

    TestBed.resetTestingModule();
    const reopened = await render('/dashboard');

    expect(reopened.componentInstance['collapsed']()).toBe(true);
  });

  it('widens the rail rather than opening a group into nowhere', async () => {
    const fixture = await render('/dashboard');
    const layout = TestBed.inject(LayoutStore);
    layout.toggleSidebarCollapsed();
    await fixture.whenStable();

    const financial = fixture.componentInstance['navItems'].find(
      (item) => item.route === '/financial',
    );
    fixture.componentInstance['toggleGroup'](financial!);
    await fixture.whenStable();

    expect(layout.sidebarCollapsed()).toBe(false);
    expect(links(fixture)).toContain('Statement');
  });

  it('translates the whole menu', async () => {
    const fixture = await render('/dashboard');

    TestBed.inject(I18nService).use('pt-BR');
    await fixture.whenStable();

    const labels = links(fixture);
    expect(labels).toContain('Pacientes');
    expect(labels).toContain('Financeiro');
  });
});
