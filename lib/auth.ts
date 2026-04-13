import { scrypt, randomBytes, timingSafeEqual, createHmac } from 'crypto';

export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex'); // 64-char hex string
}
import { promisify } from 'util';
import { cookies } from 'next/headers';

const scryptAsync = promisify(scrypt);

const SECRET = process.env.AUTH_SECRET ?? 'change-this-secret-in-production';
const SESSION_COOKIE = 'session';
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days (seconds)

// ─── Types ───────────────────────────────────────────────────────
export type UserRole = 'user' | 'admin';

export interface SessionPayload {
  userId: number;
  username: string;
  role: UserRole;
  exp: number; // Unix timestamp (seconds)
}

// ─── Password hashing (scrypt via Node.js crypto) ────────────────
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const key = await scryptAsync(password, salt, 64);
  return `${(key as Buffer).toString('hex')}.${salt}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [hash, salt] = stored.split('.');
  if (!hash || !salt) return false;
  const key = await scryptAsync(password, salt, 64);
  const keyBuf = key as Buffer;
  const hashBuf = Buffer.from(hash, 'hex');
  if (keyBuf.length !== hashBuf.length) return false;
  return timingSafeEqual(keyBuf, hashBuf);
}

// ─── Token (HMAC-SHA256 signed, no external JWT lib) ─────────────
export function createToken(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyToken(token: string): SessionPayload | null {
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;
  const data = token.slice(0, dot);
  const sig  = token.slice(dot + 1);

  const expected = createHmac('sha256', SECRET).update(data).digest('base64url');
  const sigBuf      = Buffer.from(sig,      'base64url');
  const expectedBuf = Buffer.from(expected, 'base64url');
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(data, 'base64url').toString()
    ) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

// ─── Session helpers (Server Components / Route Handlers only) ───
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = createToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   SESSION_TTL,
    path:     '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
