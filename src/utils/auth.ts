/**
 * Hashes a password using the Web Crypto API (SHA-256).
 * This provides a secure way to handle passwords on the client-side without storing them in plain text.
 * @param password The plain-text password to hash.
 * @returns A promise that resolves to a hex-encoded string of the hash.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}