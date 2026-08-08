export interface ClinicProfile {
  readonly displayName: string;
  readonly email: string;
  readonly phone: string;
  /** Slug of the clinic's public page. */
  readonly username: string;
  readonly shortAbout: string;
  readonly about: string;
  readonly timezone: string;
  /** Whether the clinic is listed on the public portal. */
  readonly searchable: boolean;
}

export interface ClinicAddress {
  readonly postalCode: string;
  readonly street: string;
  readonly number: string;
  readonly complement: string;
  readonly neighborhood: string;
  readonly city: string;
  /** Two-letter Brazilian state code. */
  readonly state: string;
}

export interface ClinicSettings {
  readonly profile: ClinicProfile;
  readonly address: ClinicAddress;
  /** True when the data came from the in-memory demo backend. */
  readonly isDemoData: boolean;
}

export interface PasswordChange {
  readonly currentPassword: string;
  readonly newPassword: string;
}
