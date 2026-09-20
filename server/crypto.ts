import crypto from 'node:crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'vAuLtGuArD_sEcUrE_kEy_2026_32b!'; // 32 chars
const JWT_SECRET = process.env.JWT_SECRET || 'vaultguard_jwt_encryption_secret_key_2026';

// 32-byte key buffer
const keyBuffer = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();

/**
 * Encrypt sensitive string data using AES-256-GCM (Authenticated Encryption)
 */
export function encryptField(plainText: string): string {
  if (!plainText) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt AES-256-GCM data
 */
export function decryptField(cipherPayload: string): string {
  if (!cipherPayload || !cipherPayload.includes(':')) return cipherPayload;
  try {
    const parts = cipherPayload.split(':');
    if (parts.length !== 3) return cipherPayload;
    const [ivHex, authTagHex, encryptedHex] = parts;
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return cipherPayload; // Fallback if not encrypted
  }
}

/**
 * Generate SHA-256 cryptographic audit receipt hash
 */
export function generateProofHash(data: Record<string, unknown> | string): string {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  const hash = crypto.createHash('sha256').update(content).digest('hex').toUpperCase();
  return `#${hash.slice(0, 4)}-${hash.slice(4, 8)}`;
}

/**
 * Generate HMAC-SHA256 JWT Token
 */
export function createJwtToken(payload: Record<string, unknown>, expiresInSec = 86400): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSec;
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify HMAC-SHA256 JWT Token
 */
export function verifyJwtToken(token: string): Record<string, unknown> | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  if (signature !== expectedSignature) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return decoded;
  } catch {
    return null;
  }
}
