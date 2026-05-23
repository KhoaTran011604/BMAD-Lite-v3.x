import { NextRequest, NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, SessionIdentity, verifySessionToken } from '@/lib/auth-helper';

export const getServerSession = (req: NextRequest): SessionIdentity | null => {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  return verifySessionToken(sessionToken);
};

type WriteAccessResult =
  | {
      session: SessionIdentity;
    }
  | {
      response: NextResponse;
    };

export const requireWriteAccess = (req: NextRequest): WriteAccessResult => {
  const session = getServerSession(req);

  if (!session) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  if (session.role === 'Worker') {
    return {
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { session };
};
