import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withAdminAuth, isAuthenticated } from '@/lib/auth/middleware';
import * as jwtModule from '@/lib/auth/jwt';

// Mock the JWT module
jest.mock('@/lib/auth/jwt');

describe('Authentication Middleware', () => {
  const mockTokenPayload = {
    userId: 'test-user-123',
    email: 'test@example.com',
    role: 'user' as const,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
  };

  const mockAdminPayload = {
    userId: 'admin-user-123',
    email: 'admin@example.com',
    role: 'admin' as const,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 900,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withAuth', () => {
    it('should return user payload for valid token', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer valid-token-123',
        },
      });

      (jwtModule.extractTokenFromHeader as jest.Mock).mockReturnValue('valid-token-123');
      (jwtModule.verifyAccessToken as jest.Mock).mockResolvedValue(mockTokenPayload);

      const result = await withAuth(mockRequest);

      expect(result).toHaveProperty('user');
      expect(result).not.toHaveProperty('error');
      if ('user' in result) {
        expect(result.user.userId).toBe('test-user-123');
        expect(result.user.email).toBe('test@example.com');
        expect(result.user.role).toBe('user');
      }
    });

    it('should return error for missing token', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: {},
      });

      (jwtModule.extractTokenFromHeader as jest.Mock).mockReturnValue(null);

      const result = await withAuth(mockRequest);

      expect(result).toHaveProperty('error');
      expect(result).not.toHaveProperty('user');
      if ('error' in result) {
        expect(result.error.status).toBe(401);
      }
    });

    it('should return error for invalid token', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      (jwtModule.extractTokenFromHeader as jest.Mock).mockReturnValue('invalid-token');
      (jwtModule.verifyAccessToken as jest.Mock).mockResolvedValue(null);

      const result = await withAuth(mockRequest);

      expect(result).toHaveProperty('error');
      expect(result).not.toHaveProperty('user');
      if ('error' in result) {
        expect(result.error.status).toBe(401);
      }
    });

    it('should return error for expired token', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer expired-token',
        },
      });

      (jwtModule.extractTokenFromHeader as jest.Mock).mockReturnValue('expired-token');
      (jwtModule.verifyAccessToken as jest.Mock).mockResolvedValue(null); // Expired tokens return null

      const result = await withAuth(mockRequest);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error.status).toBe(401);
      }
    });

    it('should handle Authorization header without Bearer prefix', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Basic dGVzdDp0ZXN0',
        },
      });

      (jwtModule.extractTokenFromHeader as jest.Mock).mockReturnValue(null);

      const result = await withAuth(mockRequest);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error.status).toBe(401);
      }
    });
  });

  describe('withAdminAuth', () => {
    it('should return user payload for valid admin token', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/admin/test', {
        headers: {
          authorization: 'Bearer admin-token-123',
        },
      });

      (jwtModule.extractTokenFromHeader as jest.Mock).mockReturnValue('admin-token-123');
      (jwtModule.verifyAccessToken as jest.Mock).mockResolvedValue(mockAdminPayload);

      const result = await withAdminAuth(mockRequest);

      expect(result).toHaveProperty('user');
      expect(result).not.toHaveProperty('error');
      if ('user' in result) {
        expect(result.user.role).toBe('admin');
      }
    });

    it('should return error for non-admin user', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/admin/test', {
        headers: {
          authorization: 'Bearer user-token-123',
        },
      });

      (jwtModule.extractTokenFromHeader as jest.Mock).mockReturnValue('user-token-123');
      (jwtModule.verifyAccessToken as jest.Mock).mockResolvedValue(mockTokenPayload);

      const result = await withAdminAuth(mockRequest);

      expect(result).toHaveProperty('error');
      expect(result).not.toHaveProperty('user');
      if ('error' in result) {
        expect(result.error.status).toBe(403);
      }
    });

    it('should return error for missing token', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/admin/test', {
        headers: {},
      });

      (jwtModule.extractTokenFromHeader as jest.Mock).mockReturnValue(null);

      const result = await withAdminAuth(mockRequest);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error.status).toBe(401);
      }
    });

    it('should return error for invalid token', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/admin/test', {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      (jwtModule.extractTokenFromHeader as jest.Mock).mockReturnValue('invalid-token');
      (jwtModule.verifyAccessToken as jest.Mock).mockResolvedValue(null);

      const result = await withAdminAuth(mockRequest);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error.status).toBe(401);
      }
    });

    it('should return error for expired token', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/admin/test', {
        headers: {
          authorization: 'Bearer expired-token',
        },
      });

      (jwtModule.extractTokenFromHeader as jest.Mock).mockReturnValue('expired-token');
      (jwtModule.verifyAccessToken as jest.Mock).mockResolvedValue(null);

      const result = await withAdminAuth(mockRequest);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error.status).toBe(401);
      }
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for authenticated result', () => {
      const result = { user: mockTokenPayload };
      expect(isAuthenticated(result)).toBe(true);
    });

    it('should return false for error result', () => {
      const result = { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
      expect(isAuthenticated(result)).toBe(false);
    });

    it('should properly type-guard authenticated results', () => {
      const result = { user: mockTokenPayload };
      if (isAuthenticated(result)) {
        expect(result.user.userId).toBe('test-user-123');
      }
    });
  });

  describe('Token Expiration in Middleware', () => {
    it('should handle expired access tokens gracefully', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer expired-token',
        },
      });

      (jwtModule.extractTokenFromHeader as jest.Mock).mockReturnValue('expired-token');
      (jwtModule.verifyAccessToken as jest.Mock).mockResolvedValue(null); // Expired token

      const result = await withAuth(mockRequest);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error.status).toBe(401);
        const json = await result.error.json();
        expect(json.error).toContain('Invalid or expired token');
      }
    });

    it('should distinguish between expired and invalid tokens in error message', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer malformed-token',
        },
      });

      (jwtModule.extractTokenFromHeader as jest.Mock).mockReturnValue('malformed-token');
      (jwtModule.verifyAccessToken as jest.Mock).mockResolvedValue(null);

      const result = await withAuth(mockRequest);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        const json = await result.error.json();
        // Both expired and invalid tokens return same error message
        expect(json.error).toContain('Invalid or expired token');
      }
    });
  });

  describe('Authorization Header Extraction', () => {
    it('should extract token from Bearer authorization header', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer test-token-xyz',
        },
      });

      (jwtModule.extractTokenFromHeader as jest.Mock).mockReturnValue('test-token-xyz');
      (jwtModule.verifyAccessToken as jest.Mock).mockResolvedValue(mockTokenPayload);

      const result = await withAuth(mockRequest);

      expect(jwtModule.extractTokenFromHeader).toHaveBeenCalledWith('Bearer test-token-xyz');
      expect(result).toHaveProperty('user');
    });

    it('should handle missing authorization header', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: {},
      });

      (jwtModule.extractTokenFromHeader as jest.Mock).mockReturnValue(null);

      const result = await withAuth(mockRequest);

      expect(jwtModule.extractTokenFromHeader).toHaveBeenCalledWith(null);
      expect(result).toHaveProperty('error');
    });
  });
});
