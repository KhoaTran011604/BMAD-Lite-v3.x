import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  pbkdf2,
  randomBytes,
  timingSafeEqual,
} from 'crypto';
import { promisify } from 'util';

export type UserRole = 'Manager' | 'FarmManager' | 'Worker';

export interface SessionIdentity {
  username: string;
  role: UserRole;
}

interface SessionClaims extends SessionIdentity {
  iat: number;
  exp: number;
}

const SESSION_HEADER = {
  typ: 'JWT',
  alg: 'HS256',
  enc: 'A256GCM',
};

const SESSION_TOKEN_SEPARATOR = '.';
const SESSION_PAYLOAD_SEPARATOR = ':';
const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24;
const SALT_LENGTH_BYTES = 16;
const PBKDF2_HASH_LENGTH_BYTES = 64;
const PBKDF2_DIGEST = 'sha512';
const DEFAULT_PBKDF2_ITERATIONS = 210000;
const AES_GCM_IV_LENGTH_BYTES = 12;
const AES_GCM_TAG_LENGTH_BYTES = 16;

const pbkdf2Async = promisify(pbkdf2);

const getPbkdf2Iterations = (): number => {
  const rawValue = process.env.AUTH_PBKDF2_ITERATIONS;
  const parsedValue = rawValue ? Number.parseInt(rawValue, 10) : Number.NaN;

  if (Number.isFinite(parsedValue) && parsedValue >= 10000) {
    return parsedValue;
  }

  return DEFAULT_PBKDF2_ITERATIONS;
};

const getAuthSecret = (): string => {
  const secret = process.env.AUTH_SECRET;

  if (secret && secret.trim().length > 0) {
    return secret;
  }

  if (process.env.NODE_ENV === 'test') {
    return 'test-auth-secret-change-me';
  }

  throw new Error('AUTH_SECRET environment variable is required');
};

const toBase64Url = (value: Buffer | string): string =>
  Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const fromBase64Url = (value: string): Buffer => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = (4 - (base64.length % 4)) % 4;
  const padded = `${base64}${'='.repeat(paddingLength)}`;
  return Buffer.from(padded, 'base64');
};

const deriveSessionKeys = () => {
  const secret = getAuthSecret();

  return {
    encryptionKey: createHash('sha256').update(`${secret}:encryption`).digest(),
    signingKey: createHash('sha256').update(`${secret}:signing`).digest(),
  };
};

const signTokenData = (headerPart: string, payloadPart: string): string => {
  const { signingKey } = deriveSessionKeys();

  return toBase64Url(
    createHmac('sha256', signingKey)
      .update(`${headerPart}${SESSION_TOKEN_SEPARATOR}${payloadPart}`)
      .digest()
  );
};

const safeJsonParse = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const hasExpired = (exp: number): boolean => {
  const currentUnixTime = Math.floor(Date.now() / 1000);
  return exp <= currentUnixTime;
};

export const hashPassword = async (password: string): Promise<{ passwordHash: string; salt: string }> => {
  const salt = randomBytes(SALT_LENGTH_BYTES).toString('hex');
  const iterations = getPbkdf2Iterations();

  const derivedKey = await pbkdf2Async(password, salt, iterations, PBKDF2_HASH_LENGTH_BYTES, PBKDF2_DIGEST);

  return {
    passwordHash: derivedKey.toString('hex'),
    salt,
  };
};

export const verifyPassword = async (password: string, passwordHash: string, salt: string): Promise<boolean> => {
  const iterations = getPbkdf2Iterations();
  const derivedKey = await pbkdf2Async(password, salt, iterations, PBKDF2_HASH_LENGTH_BYTES, PBKDF2_DIGEST);
  const providedHashBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
  const expectedHashBuffer = Buffer.from(passwordHash, 'hex');

  if (providedHashBuffer.length !== expectedHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedHashBuffer, expectedHashBuffer);
};

export const createSessionToken = (identity: SessionIdentity, ttlSeconds = DEFAULT_SESSION_TTL_SECONDS): string => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const claims: SessionClaims = {
    ...identity,
    iat: issuedAt,
    exp: issuedAt + ttlSeconds,
  };

  const { encryptionKey } = deriveSessionKeys();
  const iv = randomBytes(AES_GCM_IV_LENGTH_BYTES);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey, iv, {
    authTagLength: AES_GCM_TAG_LENGTH_BYTES,
  });

  const encryptedClaims = Buffer.concat([cipher.update(JSON.stringify(claims), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const encryptedPayload = [toBase64Url(iv), toBase64Url(authTag), toBase64Url(encryptedClaims)].join(
    SESSION_PAYLOAD_SEPARATOR
  );

  const headerPart = toBase64Url(JSON.stringify(SESSION_HEADER));
  const payloadPart = toBase64Url(encryptedPayload);
  const signaturePart = signTokenData(headerPart, payloadPart);

  return `${headerPart}${SESSION_TOKEN_SEPARATOR}${payloadPart}${SESSION_TOKEN_SEPARATOR}${signaturePart}`;
};

export const verifySessionToken = (token: string): SessionIdentity | null => {
  const [headerPart, payloadPart, signaturePart] = token.split(SESSION_TOKEN_SEPARATOR);

  if (!headerPart || !payloadPart || !signaturePart) {
    return null;
  }

  const expectedSignature = signTokenData(headerPart, payloadPart);
  const providedSignatureBuffer = Buffer.from(signaturePart, 'utf8');
  const expectedSignatureBuffer = Buffer.from(expectedSignature, 'utf8');

  if (providedSignatureBuffer.length !== expectedSignatureBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(providedSignatureBuffer, expectedSignatureBuffer)) {
    return null;
  }

  const headerJson = fromBase64Url(headerPart).toString('utf8');
  const parsedHeader = safeJsonParse<{ typ?: string; alg?: string; enc?: string }>(headerJson);

  if (!parsedHeader || parsedHeader.typ !== SESSION_HEADER.typ || parsedHeader.alg !== SESSION_HEADER.alg) {
    return null;
  }

  const encodedEncryptedPayload = fromBase64Url(payloadPart).toString('utf8');
  const [ivPart, authTagPart, encryptedClaimsPart] = encodedEncryptedPayload.split(SESSION_PAYLOAD_SEPARATOR);

  if (!ivPart || !authTagPart || !encryptedClaimsPart) {
    return null;
  }

  const { encryptionKey } = deriveSessionKeys();

  try {
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey, fromBase64Url(ivPart), {
      authTagLength: AES_GCM_TAG_LENGTH_BYTES,
    });
    decipher.setAuthTag(fromBase64Url(authTagPart));

    const claimsJson = Buffer.concat([
      decipher.update(fromBase64Url(encryptedClaimsPart)),
      decipher.final(),
    ]).toString('utf8');

    const claims = safeJsonParse<SessionClaims>(claimsJson);

    if (!claims || typeof claims.username !== 'string' || !claims.username.trim() || !claims.role || hasExpired(claims.exp)) {
      return null;
    }

    if (claims.role !== 'Manager' && claims.role !== 'FarmManager' && claims.role !== 'Worker') {
      return null;
    }

    return {
      username: claims.username,
      role: claims.role,
    };
  } catch {
    return null;
  }
};

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: DEFAULT_SESSION_TTL_SECONDS,
};

export const SESSION_COOKIE_NAME = 'agrikeep_session';
