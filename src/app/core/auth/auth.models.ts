export type SubscriptionStatus = 'available' | 'trialing' | 'past_due' | 'canceled';

export interface AccountSubscription {
  readonly status: SubscriptionStatus;
  readonly trial_start?: string;
  readonly trial_end?: string;
}

export interface Account {
  readonly id?: number;
  readonly display_name: string;
  readonly email?: string;
  readonly subscriptions?: readonly AccountSubscription[];
}

/** Shape returned by `GET api/accounts/token.json`. */
export interface TokenResponse {
  readonly token: string;
  readonly account: Account;
}

export interface Session {
  readonly token: string;
  readonly account: Account;
}

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface SignUpPayload {
  readonly clinicName: string;
  readonly displayName: string;
  readonly email: string;
  readonly password: string;
}

/** Error payload the API returns on a rejected request. */
export interface ApiErrorBody {
  readonly errors?: string | readonly string[];
}
