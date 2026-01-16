import { POST } from '@/app/api/auth/refresh/route';
import * as jwtModule from '@/lib/auth/jwt';
import * as dbModule from '@/lib/db/mongodb';
import User from '@/models/User';

// Mock dependencies
jest.mock('@/lib/auth/jwt');
jest.mock('@/lib/db/mongodb');
jest.mock('@/models/User');

describe('POST /api/auth/refresh', () => {
  const mockTokenPayload = {
    userId: 'test-user-123',
    email: 'test@example.com',
    role: 'user' as const,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 604800, // 7 days
  };

  const mockNewTokens = {
    accessToken: 'new-access-token-xyz',
    refreshToken: 'new-refresh-token-xyz',
  };

  const mockUser = {
    _id: 'test-user-123',
    email: 'test@example.com',
    role: 'user',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (dbModule.default as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Token Rotation Flow', () => {
    it('should generate new tokens when refresh token is valid', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(mockTokenPayload);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (jwtModule.generateTokens as jest.Mock).mockResolvedValue(mockNewTokens);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.accessToken).toBe(mockNewTokens.accessToken);
      expect(data.refreshToken).toBe(mockNewTokens.refreshToken);
    });

    it('should return 400 when refresh token is missing', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Refresh token is required');
    });

    it('should return 400 when refresh token is null', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: null }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Refresh token is required');
    });

    it('should return 401 when refresh token is invalid', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'invalid-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(null);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Invalid or expired refresh token');
    });

    it('should return 401 when refresh token is expired', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'expired-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(null);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Invalid or expired refresh token');
    });

    it('should return 401 when user is not found', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(mockTokenPayload);
      (User.findById as jest.Mock).mockResolvedValue(null);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('User not found');
    });

    it('should call generateTokens with correct user payload', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(mockTokenPayload);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (jwtModule.generateTokens as jest.Mock).mockResolvedValue(mockNewTokens);

      await POST(request);

      expect(jwtModule.generateTokens).toHaveBeenCalledWith({
        userId: mockUser._id.toString(),
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should connect to database before querying user', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'v-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(mockTokenPayload);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (jwtModule.generateTokens as jest.Mock).mockResolvedValue(mockNewTokens);

      await POST(request);

      expect(dbModule.default).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database connection error', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(mockTokenPayload);
      (dbModule.default as jest.Mock).mockRejectedValue(new Error('DB Connection failed'));

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Internal Server Error');
    });

    it('should return 500 on user query error', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(mockTokenPayload);
      (User.findById as jest.Mock).mockRejectedValue(new Error('Query failed'));

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Internal Server Error');
    });

    it('should return 500 on token generation error', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(mockTokenPayload);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (jwtModule.generateTokens as jest.Mock).mockRejectedValue(new Error('Token generation failed'));

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Internal Server Error');
    });

    it('should log errors to console', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });

      const testError = new Error('Test error');
      (jwtModule.verifyRefreshToken as jest.Mock).mockRejectedValue(testError);

      await POST(request);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Refresh Token Error:', testError);

      consoleErrorSpy.mockRestore();
    });

    it('should handle malformed JSON in request body', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Internal Server Error');
    });
  });

  describe('Response Format', () => {
    it('should return accessToken and refreshToken in response', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(mockTokenPayload);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (jwtModule.generateTokens as jest.Mock).mockResolvedValue(mockNewTokens);

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('accessToken');
      expect(data).toHaveProperty('refreshToken');
      expect(data).not.toHaveProperty('error');
    });

    it('should not return user data in response', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(mockTokenPayload);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (jwtModule.generateTokens as jest.Mock).mockResolvedValue(mockNewTokens);

      const response = await POST(request);
      const data = await response.json();

      expect(data).not.toHaveProperty('user');
      expect(data).not.toHaveProperty('email');
      expect(data).not.toHaveProperty('role');
    });

    it('should return proper error format', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('string');
    });
  });

  describe('Token Verification', () => {
    it('should verify refresh token before generating new tokens', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'test-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(mockTokenPayload);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (jwtModule.generateTokens as jest.Mock).mockResolvedValue(mockNewTokens);

      await POST(request);

      expect(jwtModule.verifyRefreshToken).toHaveBeenCalledWith('test-refresh-token');
    });

    it('should extract userId from verified refresh token payload', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(mockTokenPayload);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (jwtModule.generateTokens as jest.Mock).mockResolvedValue(mockNewTokens);

      await POST(request);

      expect(User.findById).toHaveBeenCalledWith(mockTokenPayload.userId);
    });
  });

  describe('Security - Token Rotation', () => {
    it('should generate new refresh token on each refresh', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'old-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(mockTokenPayload);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (jwtModule.generateTokens as jest.Mock).mockResolvedValue(mockNewTokens);

      const response = await POST(request);
      const data = await response.json();

      expect(data.refreshToken).not.toBe('old-refresh-token');
      expect(data.refreshToken).toBe(mockNewTokens.refreshToken);
    });

    it('should generate new access token on each refresh', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(mockTokenPayload);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (jwtModule.generateTokens as jest.Mock).mockResolvedValue(mockNewTokens);

      const response = await POST(request);
      const data = await response.json();

      expect(data.accessToken).toBe(mockNewTokens.accessToken);
      expect(jwtModule.generateTokens).toHaveBeenCalled();
    });

    it('should call generateTokens which creates both tokens', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(mockTokenPayload);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (jwtModule.generateTokens as jest.Mock).mockResolvedValue(mockNewTokens);

      await POST(request);

      expect(jwtModule.generateTokens).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Validation', () => {
    it('should verify user still exists after token verification', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(mockTokenPayload);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (jwtModule.generateTokens as jest.Mock).mockResolvedValue(mockNewTokens);

      await POST(request);

      expect(User.findById).toHaveBeenCalledWith(mockTokenPayload.userId);
    });

    it('should reject refresh if user was deleted', async () => {
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(mockTokenPayload);
      (User.findById as jest.Mock).mockResolvedValue(null);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('User not found');
    });

    it('should preserve user role in new tokens', async () => {
      const adminUser = { ...mockUser, role: 'admin' };
      const request = new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });

      (jwtModule.verifyRefreshToken as jest.Mock).mockResolvedValue(mockTokenPayload);
      (User.findById as jest.Mock).mockResolvedValue(adminUser);
      (jwtModule.generateTokens as jest.Mock).mockResolvedValue(mockNewTokens);

      await POST(request);

      expect(jwtModule.generateTokens).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'admin',
        })
      );
    });
  });
});
