/**
 * Integration tests for JWT token expiration handling
 * Tests the actual JWT implementation without mocking jose library
 */
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
} from '@/lib/auth/jwt';

describe('JWT Token Expiration - Integration Tests', () => {
  const testPayload = {
    userId: 'test-user-123',
    email: 'test@example.com',
    role: 'user' as const,
  };

  describe('Access Token Generation and Verification', () => {
    it('should generate and verify a valid access token', async () => {
      const token = await generateAccessToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const verified = await verifyAccessToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(testPayload.userId);
      expect(verified?.email).toBe(testPayload.email);
      expect(verified?.role).toBe(testPayload.role);
    });

    it('should include iat and exp claims in access token', async () => {
      const token = await generateAccessToken(testPayload);
      const verified = await verifyAccessToken(token);

      expect(verified).toHaveProperty('iat');
      expect(verified).toHaveProperty('exp');
      expect(typeof verified?.iat).toBe('number');
      expect(typeof verified?.exp).toBe('number');
      expect(verified!.exp).toBeGreaterThan(verified!.iat!);
    });

    it('should have 15 minute expiration for access tokens', async () => {
      const token = await generateAccessToken(testPayload);
      const verified = await verifyAccessToken(token);

      const expirationTime = (verified?.exp || 0) - (verified?.iat || 0);
      // 15 minutes = 900 seconds (allow 1 second variance)
      expect(expirationTime).toBeGreaterThanOrEqual(899);
      expect(expirationTime).toBeLessThanOrEqual(901);
    });
  });

  describe('Refresh Token Generation and Verification', () => {
    it('should generate and verify a valid refresh token', async () => {
      const token = await generateRefreshToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const verified = await verifyRefreshToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(testPayload.userId);
    });

    it('should include iat and exp claims in refresh token', async () => {
      const token = await generateRefreshToken(testPayload);
      const verified = await verifyRefreshToken(token);

      expect(verified).toHaveProperty('iat');
      expect(verified).toHaveProperty('exp');
      expect(typeof verified?.iat).toBe('number');
      expect(typeof verified?.exp).toBe('number');
    });

    it('should have 7 day expiration for refresh tokens', async () => {
      const token = await generateRefreshToken(testPayload);
      const verified = await verifyRefreshToken(token);

      const expirationTime = (verified?.exp || 0) - (verified?.iat || 0);
      // 7 days = 604800 seconds (allow 1 second variance)
      expect(expirationTime).toBeGreaterThanOrEqual(604799);
      expect(expirationTime).toBeLessThanOrEqual(604801);
    });
  });

  describe('Token Pair Generation', () => {
    it('should generate both access and refresh tokens', async () => {
      const tokens = await generateTokens(testPayload);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });

    it('should generate tokens with correct payloads', async () => {
      const tokens = await generateTokens(testPayload);

      const accessVerified = await verifyAccessToken(tokens.accessToken);
      const refreshVerified = await verifyRefreshToken(tokens.refreshToken);

      expect(accessVerified?.userId).toBe(testPayload.userId);
      expect(refreshVerified?.userId).toBe(testPayload.userId);
      expect(accessVerified?.role).toBe('user');
      expect(refreshVerified?.role).toBe('user');
    });
  });

  describe('Expired Token Handling', () => {
    it('should return null for expired access tokens', async () => {
      // Create an expired token by manipulating time
      const { SignJWT } = await import('jose');
      const ACCESS_TOKEN_SECRET = new TextEncoder().encode(
        process.env.JWT_ACCESS_SECRET || 'test-access-secret-key-min-32-chars-long!'
      );

      const expiredToken = await new SignJWT({ ...testPayload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(Math.floor(Date.now() / 1000) - 1000) // Issued 1000 seconds ago
        .setExpirationTime('0s') // Expired immediately
        .sign(ACCESS_TOKEN_SECRET);

      const verified = await verifyAccessToken(expiredToken);
      expect(verified).toBeNull();
    });

    it('should NOT log errors for expired access tokens', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { SignJWT } = await import('jose');
      const ACCESS_TOKEN_SECRET = new TextEncoder().encode(
        process.env.JWT_ACCESS_SECRET || 'test-access-secret-key-min-32-chars-long!'
      );

      const expiredToken = await new SignJWT({ ...testPayload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(Math.floor(Date.now() / 1000) - 1000)
        .setExpirationTime('0s')
        .sign(ACCESS_TOKEN_SECRET);

      await verifyAccessToken(expiredToken);

      // Expired access tokens should NOT log errors
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should log errors for invalid access token format', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await verifyAccessToken('invalid.token.format');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('Access token verification failed');

      consoleErrorSpy.mockRestore();
    });

    it('should log errors for malformed JWT', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await verifyAccessToken('not.a.jwt');

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should log errors for invalid signature', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { SignJWT } = await import('jose');
      const WRONG_SECRET = new TextEncoder().encode('wrong-secret-key-min-32-chars-long!');

      const token = await new SignJWT({ ...testPayload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(WRONG_SECRET);

      await verifyAccessToken(token);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('Access token verification failed');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error Logging Behavior - Key Requirement', () => {
    it('CRITICAL: Expired access tokens should NOT log errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { SignJWT } = await import('jose');
      const ACCESS_TOKEN_SECRET = new TextEncoder().encode(
        process.env.JWT_ACCESS_SECRET || 'test-access-secret-key-min-32-chars-long!'
      );

      const expiredToken = await new SignJWT({ ...testPayload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(Math.floor(Date.now() / 1000) - 1000)
        .setExpirationTime('0s')
        .sign(ACCESS_TOKEN_SECRET);

      const result = await verifyAccessToken(expiredToken);

      // CRITICAL: Expired tokens return null
      expect(result).toBeNull();
      // CRITICAL: No error logging for expiration
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('CRITICAL: Non-expiration errors MUST be logged', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Invalid format - not an expiration error
      await verifyAccessToken('invalid.format');

      // CRITICAL: Non-expiration errors must be logged
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('CRITICAL: Refresh token errors should be logged (including expiration)', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { SignJWT } = await import('jose');
      const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
        process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key-min-32-chars-long!'
      );

      const expiredToken = await new SignJWT({ ...testPayload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(Math.floor(Date.now() / 1000) - 1000)
        .setExpirationTime('0s')
        .sign(REFRESH_TOKEN_SECRET);

      await verifyRefreshToken(expiredToken);

      // CRITICAL: Refresh token errors ARE logged (unlike access token expiration)
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('Refresh token verification failed');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Token Header Extraction', () => {
    it('should extract token from Bearer header', () => {
      const token = 'test-token-123';
      const header = `Bearer ${token}`;
      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });

    it('should return null for missing header', () => {
      const extracted = extractTokenFromHeader(null);
      expect(extracted).toBeNull();
    });

    it('should return null for non-Bearer header', () => {
      const extracted = extractTokenFromHeader('Basic dGVzdDp0ZXN0');
      expect(extracted).toBeNull();
    });

    it('should return null for empty header', () => {
      const extracted = extractTokenFromHeader('');
      expect(extracted).toBeNull();
    });

    it('should be case-sensitive for Bearer prefix', () => {
      const extracted = extractTokenFromHeader('bearer token');
      expect(extracted).toBeNull();
    });
  });

  describe('Token Payload Preservation', () => {
    it('should preserve all payload fields in access token', async () => {
      const adminPayload = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'admin' as const,
      };

      const token = await generateAccessToken(adminPayload);
      const verified = await verifyAccessToken(token);

      expect(verified?.userId).toBe('admin-123');
      expect(verified?.email).toBe('admin@example.com');
      expect(verified?.role).toBe('admin');
    });

    it('should preserve all payload fields in refresh token', async () => {
      const adminPayload = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'admin' as const,
      };

      const token = await generateRefreshToken(adminPayload);
      const verified = await verifyRefreshToken(token);

      expect(verified?.userId).toBe('admin-123');
      expect(verified?.email).toBe('admin@example.com');
      expect(verified?.role).toBe('admin');
    });
  });

  describe('JWT Format Validation', () => {
    it('should generate valid JWT format (three parts separated by dots)', async () => {
      const token = await generateAccessToken(testPayload);
      const parts = token.split('.');
      expect(parts.length).toBe(3);
      expect(parts[0].length).toBeGreaterThan(0);
      expect(parts[1].length).toBeGreaterThan(0);
      expect(parts[2].length).toBeGreaterThan(0);
    });

    it('should reject tokens with invalid format', async () => {
      const result = await verifyAccessToken('not-a-valid-jwt');
      expect(result).toBeNull();
    });

    it('should reject tokens with missing parts', async () => {
      const result = await verifyAccessToken('only.two');
      expect(result).toBeNull();
    });

    it('should reject tokens with empty parts', async () => {
      const result = await verifyAccessToken('...');
      expect(result).toBeNull();
    });
  });
});
