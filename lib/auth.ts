import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get('user-email')?.value;
  
  if (!userEmail) return null;
  
  return await prisma.user.findUnique({
    where: { email: userEmail }
  });
}

export async function login(email: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user) {
    throw new Error('Invalid email');
  }
  
  const cookieStore = await cookies();
  cookieStore.set('user-email', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
  
  return user;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('user-email');
}