export const userPasswords = {
  valid: 'PlanetVpnE2E!2026',
  short: 'short',
  noDigits: 'PasswordOnly',
  noUppercase: 'password123',
  mismatch: 'PlanetVpnE2E!2027'
} as const;

export const userEmails = {
  invalid: 'invalid-email',
  empty: '',
  existing: 'qa@example.com'
} as const;
