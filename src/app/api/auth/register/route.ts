import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import dbConnect from '@/lib/dbConnect';
import { hashPassword } from '@/lib/auth-helper';
import User from '@/models/User';

const registerSchema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Username must be alphanumeric'),
  password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Manager', 'FarmManager', 'Worker'], {
    errorMap: () => ({ message: 'Role must be one of: Manager, FarmManager, Worker' }),
  }),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body: unknown = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const message = validation.error.errors.map((entry) => entry.message).join(', ');
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const normalizedUsername = validation.data.username.toLowerCase();

    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const { passwordHash, salt } = await hashPassword(validation.data.password);

    const newUser = await User.create({
      username: normalizedUsername,
      passwordHash,
      salt,
      role: validation.data.role,
    });

    return NextResponse.json(
      {
        data: {
          id: newUser._id.toString(),
          username: newUser.username,
          role: newUser.role,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to register user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
