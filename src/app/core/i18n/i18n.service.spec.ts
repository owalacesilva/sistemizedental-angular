import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { I18nService } from './i18n.service';
import { injectPlural, injectT } from './translate';

@Component({
  selector: 'app-i18n-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{ t('nav.patients') }} · {{ plural('patients.count', 2) }}`,
})
class Host {
  protected readonly t = injectT();
  protected readonly plural = injectPlural();
}

describe('I18nService', () => {
  let i18n: I18nService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    i18n = TestBed.inject(I18nService);
  });

  afterEach(() => localStorage.clear());

  it('starts on English when the browser asks for nothing else', () => {
    expect(i18n.locale()).toBe('en-US');
    expect(i18n.t('nav.patients')).toBe('Patients');
  });

  it('translates every message once the language changes', () => {
    i18n.use('pt-BR');

    expect(i18n.locale()).toBe('pt-BR');
    expect(i18n.t('nav.patients')).toBe('Pacientes');
  });

  it('fills placeholders', () => {
    expect(i18n.t('pagination.showing', { first: 1, last: 10, total: 24 })).toBe(
      'Showing 1–10 of 24',
    );
  });

  it('leaves a placeholder alone when no value is supplied', () => {
    expect(i18n.t('search.empty')).toContain('{term}');
  });

  it('picks the singular or the plural by count', () => {
    expect(i18n.plural('patients.count', 1)).toBe('1 patient');
    expect(i18n.plural('patients.count', 24)).toBe('24 patients');

    i18n.use('pt-BR');
    expect(i18n.plural('patients.count', 1)).toBe('1 paciente');
    expect(i18n.plural('patients.count', 24)).toBe('24 pacientes');
  });

  it('renders the key itself for a message that does not exist', () => {
    // Cast: the point is what happens when a key slips through untyped.
    expect(i18n.t('nope.not.a.key' as never)).toBe('nope.not.a.key');
  });

  it('remembers the choice for the next visit', () => {
    i18n.use('pt-BR');
    TestBed.resetTestingModule();

    expect(TestBed.inject(I18nService).locale()).toBe('pt-BR');
  });

  it('stamps the language on the document', () => {
    i18n.use('pt-BR');
    TestBed.tick();

    expect(document.documentElement.lang).toBe('pt-BR');
  });

  it('re-renders a template when the language changes', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('Patients · 2 patients');

    TestBed.inject(I18nService).use('pt-BR');
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('Pacientes · 2 pacientes');
  });
});
