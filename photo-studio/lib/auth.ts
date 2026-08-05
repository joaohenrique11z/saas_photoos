import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from './db';

const SESSION_COOKIE_NAME = 'photo_studio_session';
const SESSION_SECRET =
  process.env.SESSION_SECRET || 'default_secret_key_change_in_production_32';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  const [salt, key] = hash.split(':');
  if (!salt || !key) return false;
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return key === derivedKey;
}

function signToken(username: string): string {
  const payload = `${username}:${Date.now()}`;
  const hmac = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');
  return `${Buffer.from(payload).toString('base64')}.${hmac}`;
}

function verifyToken(token: string): string | null {
  try {
    const [encodedPayload, sig] = token.split('.');
    if (!encodedPayload || !sig) return null;
    const payload = Buffer.from(encodedPayload, 'base64').toString('utf8');
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('hex');
    if (sig !== expectedSig) return null;
    const [username] = payload.split(':');
    return username || null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(username: string) {
  const token = signToken(username);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const username = verifyToken(token);
  if (!username) return null;
  return prisma.user.findUnique({
    where: { username },
  });
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Não autorizado: Sessão inválida ou expirada.");
  }
  return user;
}
