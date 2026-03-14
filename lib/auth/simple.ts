// lib/auth/simple.ts
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'admin_session';
const COOKIE_VALUE = 'authenticated'; // simple flag

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === COOKIE_VALUE;
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
}

export async function clearAdminSession() {
  console.log('clearAdminSession called');
  const cookieStore = await cookies();
  const before = cookieStore.get(COOKIE_NAME)?.value;
  console.log('Cookie before delete:', before);
  cookieStore.delete(COOKIE_NAME);
  const after = cookieStore.get(COOKIE_NAME)?.value;
  console.log('Cookie after delete:', after);
}