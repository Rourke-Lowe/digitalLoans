import { NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await login(email);
    
    return NextResponse.json({
      success: true,
      role: user.role,
      name: user.name
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid email' },
      { status: 401 }
    );
  }
}