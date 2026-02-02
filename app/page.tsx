import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  try {
    const session = await auth();

    if (session?.user) {
      redirect('/dashboard');
    }
  } catch (error) {
    // If auth fails (e.g. database connection error), redirect to login
    console.error('Auth check failed:', error);
  }

  redirect('/login');
}
