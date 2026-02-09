// Simple sync hash matching the server's sha256 prefix.
// Uses the same algorithm: first 16 hex chars of SHA-256.
// We compute it async and cache via a hook.

export async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(buffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.slice(0, 16);
}
