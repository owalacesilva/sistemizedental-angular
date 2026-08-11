import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from '../../core/auth/auth.service';
import type { ClinicSettings } from './settings.models';
import { settingsRoutes } from './settings.routes';
import { SettingsService } from './settings.service';

const SETTINGS: ClinicSettings = {
  isDemoData: false,
  profile: {
    displayName: 'Clínica Modelo',
    email: 'contato@clinica.com',
    phone: '+55 11 3555-0100',
    username: 'clinica-modelo',
    shortAbout: '',
    about: '',
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

/**
 * The section is a shell with lazy children, so the wiring — redirect, header,
 * child render — is only exercised by going through the router. The side rail has
 * moved into the sidebar, so the shell's job is now the heading.
 */
async function navigate(path: string): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(settingsRoutes),
      { provide: SettingsService, useValue: { load: () => of(SETTINGS) } },
      {
        provide: AuthService,
        useValue: { account: () => ({ display_name: 'Clínica', email: 'contato@clinica.com' }) },
      },
    ],
  });

  const harness = await RouterTestingHarness.create(path);
  await harness.fixture.whenStable();
  return harness.fixture.nativeElement as HTMLElement;
}

describe('settingsRoutes', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('lands on the clinic profile', async () => {
    const element = await navigate('/');

    expect(element.textContent).toContain('Clinic profile');
    expect(element.querySelector<HTMLInputElement>('#displayName')?.value).toBe('Clínica Modelo');
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Clinic profile');
  });

  it('renders the address tab', async () => {
    const element = await navigate('/address');

    expect(element.textContent).toContain('Clinic address');
    expect(element.querySelector<HTMLInputElement>('#street')?.value).toBe('Avenida Paulista');
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Address');
  });

  it('renders the security tab with the signed-in account', async () => {
    const element = await navigate('/security');

    expect(element.textContent).toContain('Change password');
    expect(element.textContent).toContain('contato@clinica.com');
  });
});
