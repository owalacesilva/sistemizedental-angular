import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { type Observable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ClinicProfile, ClinicSettings } from '../settings.models';
import { SettingsService } from '../settings.service';
import { Profile } from './profile';

const SETTINGS: ClinicSettings = {
  isDemoData: false,
  profile: {
    displayName: 'Clínica Modelo',
    email: 'contato@clinicamodelo.com',
    phone: '+55 11 3555-0100',
    username: 'clinica-modelo',
    shortAbout: 'Odontologia geral.',
    about: 'Atendimento de segunda a sábado.',
    timezone: 'America/Sao_Paulo',
    searchable: true,
  },
  address: {
    postalCode: '01310-100',
    street: 'Avenida Paulista',
    number: '1578',
    complement: '',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
  },
};

async function render(service: Partial<SettingsService>): Promise<ComponentFixture<Profile>> {
  await TestBed.configureTestingModule({
    imports: [Profile],
    providers: [{ provide: SettingsService, useValue: service }],
  }).compileComponents();

  const fixture = TestBed.createComponent(Profile);
  await fixture.whenStable();
  return fixture;
}

describe('Settings · Profile', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('fills the form from the loaded account', async () => {
    const fixture = await render({ load: () => of(SETTINGS) });

    expect(fixture.componentInstance['form'].getRawValue()).toEqual(SETTINGS.profile);
  });

  it('saves the edited profile', async () => {
    const saveProfile = vi.fn<(profile: ClinicProfile) => Observable<void>>(() => of(undefined));
    const fixture = await render({ load: () => of(SETTINGS), saveProfile });

    fixture.componentInstance['form'].controls.displayName.setValue('Clínica Nova');
    fixture.componentInstance['submit']();
    await fixture.whenStable();

    expect(saveProfile).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: 'Clínica Nova' }),
    );
    expect(fixture.nativeElement.textContent).toContain('Clinic profile saved.');
  });

  it('refuses to save an invalid form', async () => {
    const saveProfile = vi.fn<(profile: ClinicProfile) => Observable<void>>(() => of(undefined));
    const fixture = await render({ load: () => of(SETTINGS), saveProfile });

    fixture.componentInstance['form'].controls.email.setValue('not-an-email');
    fixture.componentInstance['submit']();
    await fixture.whenStable();

    expect(saveProfile).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Enter a valid email address.');
  });

  it('surfaces a save failure', async () => {
    const fixture = await render({
      load: () => of(SETTINGS),
      saveProfile: () => throwError(() => new Error('Username already taken.')),
    });

    fixture.componentInstance['submit']();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Username already taken.');
  });

  it('warns that demo changes are not persisted', async () => {
    const fixture = await render({ load: () => of({ ...SETTINGS, isDemoData: true }) });

    expect(fixture.nativeElement.textContent).toContain('changes are not persisted');
  });
});
