import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    // Decode base64 payload from JWT token
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
    if (payload.role === 'client') {
      redirect('/client-dashboard');
    } else {
      redirect('/dashboard');
    }
  } catch (e) {
    console.error('Error parsing token on root redirect:', e);
    redirect('/login');
  }
}