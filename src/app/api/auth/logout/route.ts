import { NextResponse } from 'next/server';

import { sessionCookieOptions, SESSION_COOKIE_NAME } from '@/lib/auth-helper';

export async function POST() {
  const response = NextResponse.json(
    {
      data: {
        message: 'Logged out successfully',
      },
    },
    { status: 200 }
  );

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    ...sessionCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
