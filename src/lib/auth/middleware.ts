import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader, TokenPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

/**
 * Middleware to verify JWT token and extract user info
 * Returns the user payload if valid, or an error response
 */
export async function withAuth(
  request: NextRequest
): Promise<{ user: TokenPayload } | { error: NextResponse }> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      ),
    };
  }

  const payload = await verifyAccessToken(token);

  if (!payload) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Invalid or expired token' },
        { status: 401 }
      ),
    };
  }

  return { user: payload };
}

/**
 * Middleware to check if user has admin role
 */
export async function withAdminAuth(
  request: NextRequest
): Promise<{ user: TokenPayload } | { error: NextResponse }> {
  const authResult = await withAuth(request);

  if ('error' in authResult) {
    return authResult;
  }

  if (authResult.user.role !== 'admin') {
    return {
      error: NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Helper to check authentication result
 */
export function isAuthenticated(
  result: { user: TokenPayload } | { error: NextResponse }
): result is { user: TokenPayload } {
  return 'user' in result;
}
