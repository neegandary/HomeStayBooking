import {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  TokenPayload,
} from '@/lib/auth/jwt';

describe('JWT Token Expiration Handling', () => {
  const testPayload: Omit<TokenPayload, 'iat' | 'exp'> = {
    userId: 'test-user-123',
    email: 'test@example.com',
    role: 'user',
  };

  const adminPayload: Omit<TokenPayload, 'iat' | 'exp'> = {
    userId: 'admin-user-123',
    email: 'admin@example.com',
    role: 'admin',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', async () => {
      const token = await generateAccessToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    it('should generate different tokens for different calls', async () => {
      const token1 = await generateAccessToken(testPayload);
      const token2 = await generateAccessToken(testPayload);
      expect(token1).not.toBe(token2); // Different iat (issued at) times
    });

    it('should include correct payload in token', async () => {
      const token = await generateAccessToken(testPayload);
      const verified = await verifyAccessToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(testPayload.userId);
      expect(verified?.email).toBe(testPayload.email);
      expect(verified?.role).toBe(testPayload.role);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', async () => {
      const token = await generateRefreshToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should generate different tokens for different calls', async () => {
      const token1 = await generateRefreshToken(testPayload);
      const token2 = await generateRefreshToken(testPayload);
      expect(token1).not.toBe(token2);
    });

    it('should include correct payload in token', async () => {
      const token = await generateRefreshToken(testPayload);
      const verified = await verifyRefreshToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(testPayload.userId);
      expect(verified?.email).toBe(testPayload.email);
      expect(verified?.role).toBe(testPayload.role);
    });
  });

  describe('generateTokens', () => {
    it('should generate both access and refresh tokens', async () => {
      const tokens = await generateTokens(testPayload);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should generate different access and refresh tokens', async () => {
      const tokens = await generateTokens(testPayload);
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });

    it('should generate tokens with correct payloads', async () => {
      const tokens = await generateTokens(testPayload);
      const accessVerified = await verifyAccessToken(tokens.accessToken);
      const refreshVerified = await verifyRefreshToken(tokens.refreshToken);

      expect(accessVerified?.userId).toBe(testPayload.userId);
      expect(refreshVerified?.userId).toBe(testPayload.userId);
    });
  });

  describe('verifyAccessToken - Expiration Handling', () => {
    it('should verify a valid access token', async () => {
      const token = await generateAccessToken(testPayload);
      const verified = await verifyAccessToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(testPayload.userId);
    });

    it('should return null for expired access tokens without logging errors', async () => {
      // Create a token that expires immediately
      const { SignJWT } = await import('jose');
      const ACCESS_TOKEN_SECRET = new TextEncoder().encode(
        process.env.JWT_ACCESS_SECRET || 'test-access-secret-key-min-32-chars-long!'
      );

      const expiredToken = await new SignJWT({ ...testPayload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('0s') // Expires immediately
        .sign(ACCESS_TOKEN_SECRET);

      // Wait a moment to ensure token is expired
      await new Promise(resolve => setTimeout(resolve, 100));

      // Suppress console.error for this test
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const verified = await verifyAccessToken(expiredToken);

      // Expired tokens should return null WITHOUT logging errors
      expect(verified).toBeNull();
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should log errors for invalid token format', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const verified = await verifyAccessToken('invalid.token.format');

      expect(verified).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('Access token verification failed');

      consoleErrorSpy.mockRestore();
    });

    it('should log errors for malformed JWT', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const verified = await verifyAccessToken('not.a.jwt');

      expect(verified).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should log errors for invalid signature', async () => {
      const { SignJWT } = await import('jose');
      const WRONG_SECRET = new TextEncoder().encode('wrong-secret-key-min-32-chars-long!');

      const token = await new SignJWT({ ...testPayload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(WRONG_SECRET);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const verified = await verifyAccessToken(token);

      expect(verified).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('Access token verification failed');

      consoleErrorSpy.mockRestore();
    });

    it('should handle null token gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const verified = await verifyAccessToken('');

      expect(verified).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle token with missing parts', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const verified = await verifyAccessToken('only.two');

      expect(verified).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', async () => {
      const token = await generateRefreshToken(testPayload);
      const verified = await verifyRefreshToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(testPayload.userId);
    });

    it('should return null for expired refresh tokens', async () => {
      const { SignJWT } = await import('jose');
      const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
        process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key-min-32-chars-long!'
      );

      const expiredToken = await new SignJWT({ ...testPayload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('0s')
        .sign(REFRESH_TOKEN_SECRET);

      await new Promise(resolve => setTimeout(resolve, 100));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const verified = await verifyRefreshToken(expiredToken);

      expect(verified).toBeNull();
      // Refresh token errors ARE logged (unlike access token expiration)
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should log errors for invalid refresh token format', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const verified = await verifyRefreshToken('invalid.token.format');

      expect(verified).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should log errors for invalid signature on refresh token', async () => {
      const { SignJWT } = await import('jose');
      const WRONG_SECRET = new TextEncoder().encode('wrong-secret-key-min-32-chars-long!');

      const token = await new SignJWT({ ...testPayload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(WRONG_SECRET);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const verified = await verifyRefreshToken(token);

      expect(verified).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Authorization header', () => {
      const token = 'test-token-123';
      const header = `Bearer ${token}`;
      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });

    it('should return null for missing Authorization header', () => {
      const extracted = extractTokenFromHeader(null);
      expect(extracted).toBeNull();
    });

    it('should return null for header without Bearer prefix', () => {
      const extracted = extractTokenFromHeader('Basic dGVzdDp0ZXN0');
      expect(extracted).toBeNull();
    });

    it('should return null for empty header', () => {
      const extracted = extractTokenFromHeader('');
      expect(extracted).toBeNull();
    });

    it('should handle Bearer prefix case-sensitively', () => {
      const token = 'test-token-123';
      const header = `bearer ${token}`; // lowercase
      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBeNull(); // Should fail - Bearer must be uppercase
    });
  });

  describe('Token Payload Validation', () => {
    it('should preserve user role in access token', async () => {
      const token = await generateAccessToken(adminPayload);
      const verified = await verifyAccessToken(token);
      expect(verified?.role).toBe('admin');
    });

    it('should preserve user role in refresh token', async () => {
      const token = await generateRefreshToken(adminPayload);
      const verified = await verifyRefreshToken(token);
      expect(verified?.role).toBe('admin');
    });

    it('should include all required fields in token payload', async () => {
      const token = await generateAccessToken(testPayload);
      const verified = await verifyAccessToken(token);

      expect(verified).toHaveProperty('userId');
      expect(verified).toHaveProperty('email');
      expect(verified).toHaveProperty('role');
      expect(verified).toHaveProperty('iat'); // issued at
      expect(verified).toHaveProperty('exp'); // expiration
    });
  });

  describe('Error Logging Behavior', () => {
    it('should NOT log errors for expired access tokens', async () => {
      const { SignJWT } = await import('jose');
      const ACCESS_TOKEN_SECRET = new TextEncoder().encode(
        process.env.JWT_ACCESS_SECRET || 'test-access-secret-key-min-32-chars-long!'
      );

      const expiredToken = await new SignJWT({ ...testPayload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('0s')
        .sign(ACCESS_TOKEN_SECRET);

      await new Promise(resolve => setTimeout(resolve, 100));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await verifyAccessToken(expiredToken);

      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should log errors for non-expiration access token errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await verifyAccessToken('invalid.jwt.token');

      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorMessage = consoleErrorSpy.mock.calls[0][0];
      expect(errorMessage).toContain('Access token verification failed');

      consoleErrorSpy.mockRestore();
    });

    it('should log all refresh token errors including expiration', async () => {
      const { SignJWT } = await import('jose');
      const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
        process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key-min-32-chars-long!'
      );

      const expiredToken = await new SignJWT({ ...testPayload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('0s')
        .sign(REFRESH_TOKEN_SECRET);

      await new Promise(resolve => setTimeout(resolve, 100));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await verifyRefreshToken(expiredToken);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('Refresh token verification failed');

      consoleErrorSpy.mockRestore();
    });
  });
});
