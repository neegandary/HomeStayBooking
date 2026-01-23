import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { UserRole } from '@/types/auth';

// Secret keys - In production, use environment variables
const ACCESS_TOKEN_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-min-32-chars!'
);
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-min-32-chars'
);

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Generate an access token
 */
export async function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(ACCESS_TOKEN_SECRET);
}

/**
 * Generate a refresh token
 */
export async function generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(REFRESH_TOKEN_SECRET);
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokens(payload: Omit<TokenPayload, 'iat' | 'exp'>) {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(payload),
    generateRefreshToken(payload),
  ]);

  return { accessToken, refreshToken };
}

/**
 * Check if a string looks like a valid JWT format (three base64url parts separated by dots)
 */
function isValidJwtFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
}

/**
 * Verify an access token
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    // Validate token format before attempting verification
    if (!isValidJwtFormat(token)) {
      console.error('Access token has invalid format:', token?.substring(0, 50) + '...');
      return null;
    }
    const { payload } = await jwtVerify(token, ACCESS_TOKEN_SECRET);
    return payload as TokenPayload;
  } catch (error: unknown) {
    // Token expired is expected behavior - client will refresh
    // Only log non-expiration errors
    const isExpiredError = error instanceof Error &&
      'code' in error &&
      (error as { code: string }).code === 'ERR_JWT_EXPIRED';

    if (!isExpiredError) {
      console.error('Access token verification failed:', error);
    }
    return null;
  }
}

/**
 * Verify a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    // Validate token format before attempting verification
    if (!isValidJwtFormat(token)) {
      console.error('Refresh token has invalid format:', token?.substring(0, 50) + '...');
      return null;
    }
    const { payload } = await jwtVerify(token, REFRESH_TOKEN_SECRET);
    return payload as TokenPayload;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
