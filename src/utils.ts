/**
 * Cryptographically secure 8-character ID generator using alphanumeric alphabet.
 */
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function generateShortId(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return result;
}

/**
 * Compute the first 16 hex characters of SHA-256(ip + ':' + userAgent) for visitor deduplication.
 */
export async function computeVisitorHash(ip: string, userAgent: string): Promise<string> {
  const normalizedIp = (ip || '127.0.0.1').trim();
  const normalizedUa = (userAgent || 'unknown').trim();
  const input = `${normalizedIp}:${normalizedUa}`;
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hex.substring(0, 16);
}

/**
 * Validate that a URL is a legitimate public HTTP/HTTPS URL with SSRF and private network protection.
 */
export function isValidUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Reject localhost and local domain names
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1'
    ) {
      return false;
    }

    // Reject private IPv6 formats
    if (hostname.startsWith('[') || hostname.includes(':')) {
      if (
        hostname.startsWith('fe80:') ||
        hostname.startsWith('fc00:') ||
        hostname.startsWith('fd00:') ||
        hostname === '::1'
      ) {
        return false;
      }
    }

    // Reject private IPv4 ranges (10.0.0.0/8, 192.168.0.0/16, 172.16-31.0.0/12, 169.254.0.0/16 metadata)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = hostname.match(ipv4Regex);
    if (ipMatch) {
      const octet1 = parseInt(ipMatch[1], 10);
      const octet2 = parseInt(ipMatch[2], 10);

      if (octet1 === 10) return false;
      if (octet1 === 127) return false;
      if (octet1 === 169 && octet2 === 254) return false; // Cloud Metadata
      if (octet1 === 192 && octet2 === 168) return false;
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return false;
      if (octet1 === 0) return false;
    }

    // Reject pure decimal/hex encoded IPs (e.g. 2130706433 or 0x7f000001)
    if (/^0x[0-9a-f]+$/i.test(hostname) || /^\d+$/.test(hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Constant-time string equality check to prevent timing attacks against the admin key.
 */
export function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Sanitize destination URL into a clean, safe filename slug.
 */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 35) || 'qr-code'
  );
}

/**
 * Safe HTML entity escaping.
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
