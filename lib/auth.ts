import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'kaiquedev2425@gmail.com';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('12022004@Kts', 10);

export interface AdminSession {
  email: string;
  name: string;
  isAuthenticated: boolean;
}

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  if (email !== ADMIN_EMAIL) {
    return false;
  }
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const session = JSON.parse(sessionCookie.value);
    if (session.email === ADMIN_EMAIL) {
      return {
        email: session.email,
        name: 'KaiqueDev',
        isAuthenticated: true,
      };
    }
  } catch {
    return null;
  }
  
  return null;
}

export async function createAdminSession(email: string): Promise<string> {
  const session = {
    email,
    createdAt: Date.now(),
  };
  return JSON.stringify(session);
}
