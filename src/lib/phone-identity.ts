// Better Auth's credential provider is keyed by email. Customers and
// drivers sign in with a phone number instead, so we map it to a
// deterministic, non-guessable-by-format local address and use that as
// the Better Auth identity under the hood.
export function phoneToLocalEmail(phoneNumber: string): string {
  const digits = phoneNumber.replace(/[^0-9]/g, "");
  return `${digits}@phone.greenbox.local`;
}
