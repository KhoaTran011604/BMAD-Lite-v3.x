import { NextRequest, NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth-helper';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionIdentity = verifySessionToken(sessionToken);
    if (!sessionIdentity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ username: sessionIdentity.username });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      {
        data: {
          username: user.username,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to verify session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
