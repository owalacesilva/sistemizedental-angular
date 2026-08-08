import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { apiUrl } from '../../../core/api/api-url';
import { SignUp } from './sign-up';

const ACCOUNTS_ENDPOINT = apiUrl('api/accounts.json');

describe('SignUp', () => {
  let fixture: ComponentFixture<SignUp>;
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SignUp],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // Stub target so the post-sign-up navigation to /dashboard resolves.
        provideRouter([{ path: '**', children: [] }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignUp);
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  function element<T extends HTMLElement>(selector: string): T {
    const found = fixture.nativeElement.querySelector(selector) as T | null;
    expect(found, `expected to find ${selector}`).not.toBeNull();
    return found as T;
  }

  function setValue(selector: string, value: string): void {
    const input = element<HTMLInputElement>(selector);
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function fillValidForm(overrides: { confirmPassword?: string } = {}): Promise<void> {
    setValue('#clinicName', 'Bright Smile Dental');
    setValue('#displayName', 'Dr. Alex Moreira');
    setValue('#signupEmail', 'alex@clinic.com');
    setValue('#signupPassword', 'Sup3rSecret!');
    setValue('#confirmPassword', overrides.confirmPassword ?? 'Sup3rSecret!');

    const terms = element<HTMLInputElement>('#acceptTerms, [formcontrolname="acceptTerms"]');
    terms.checked = true;
    terms.dispatchEvent(new Event('change'));

    await fixture.whenStable();
  }

  it('renders the sign-up form', () => {
    expect(element('h1').textContent).toContain('Create your account');
  });

  it('blocks submission while required fields are empty', async () => {
    element<HTMLFormElement>('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    http.expectNone(ACCOUNTS_ENDPOINT);
    expect(fixture.nativeElement.textContent).toContain('Clinic name is required.');
  });

  it('reports mismatched passwords instead of submitting', async () => {
    await fillValidForm({ confirmPassword: 'Different!1' });
    element<HTMLFormElement>('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    http.expectNone(ACCOUNTS_ENDPOINT);
    expect(fixture.nativeElement.textContent).toContain('Passwords do not match.');
  });

  it('scores password strength as the user types', async () => {
    setValue('#signupPassword', 'abc');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Too weak');

    setValue('#signupPassword', 'Sup3rSecret!');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Strong');
  });

  it('creates the account and signs the user in', async () => {
    await fillValidForm();
    element<HTMLFormElement>('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    const request = http.expectOne(ACCOUNTS_ENDPOINT);
    expect(request.request.body).toMatchObject({
      account: {
        display_name: 'Bright Smile Dental',
        owner_name: 'Dr. Alex Moreira',
        email: 'alex@clinic.com',
      },
    });

    request.flush({ token: 'new-token', account: { display_name: 'Bright Smile Dental' } });
    await fixture.whenStable();

    expect(localStorage.getItem('acc_token')).toBe('new-token');
  });
});
