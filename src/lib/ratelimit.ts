/**
 * Simple in-memory rate limiter
 * No Redis needed - suitable for single instance deployment
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const attempts = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of attempts.entries()) {
      if (now > record.resetAt) {
        attempts.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if request is within rate limit
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param limit - Max requests allowed in window
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  identifier: string,
  limit = 5,
  windowMs = 60000
): RateLimitResult {
  const now = Date.now();
  const record = attempts.get(identifier);

  // First request or window expired
  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    attempts.set(identifier, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  // Within window, check limit
  if (record.count >= limit) {
    return { success: false, remaining: 0, resetAt: record.resetAt };
  }

  // Increment count
  record.count++;
  return { success: true, remaining: limit - record.count, resetAt: record.resetAt };
}

/**
 * Reset rate limit for an identifier (e.g., after successful login)
 */
export function resetRateLimit(identifier: string): void {
  attempts.delete(identifier);
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // Login: 5 attempts per minute
  login: (ip: string) => checkRateLimit(`login:${ip}`, 5, 60 * 1000),
  
  // Register: 3 accounts per hour
  register: (ip: string) => checkRateLimit(`register:${ip}`, 3, 60 * 60 * 1000),
  
  // API: 100 requests per minute
  api: (ip: string) => checkRateLimit(`api:${ip}`, 100, 60 * 1000),
  
  // Booking: 10 bookings per hour
  booking: (ip: string) => checkRateLimit(`booking:${ip}`, 10, 60 * 60 * 1000),
};
