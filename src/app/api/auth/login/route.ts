import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createSessionToken, sessionCookieOptions, SESSION_COOKIE_NAME, verifyPassword } from '@/lib/auth-helper';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const loginSchema = z.object({
  username: z.string({ required_error: 'Username is required' }).trim().min(1, 'Username is required'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body: unknown = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      const message = validation.error.errors.map((entry) => entry.message).join(', ');
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const normalizedUsername = validation.data.username.toLowerCase();
    const user = await User.findOne({ username: normalizedUsername });

    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const validPassword = await verifyPassword(validation.data.password, user.passwordHash, user.salt);
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const sessionToken = createSessionToken({
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        data: {
          username: user.username,
          role: user.role,
        },
      },
      { status: 200 }
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      ...sessionCookieOptions,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to login';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
