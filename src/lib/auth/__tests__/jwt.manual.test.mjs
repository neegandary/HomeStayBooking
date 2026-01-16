#!/usr/bin/env node

/**
 * Manual JWT Token Expiration Test Suite
 * Tests the JWT implementation directly without Jest
 */

import {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
} from '../jwt.ts';

// Test utilities
let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];

function assert(condition, message) {
  if (!condition) {
    testsFailed++;
    failedTests.push(message);
    console.error(`  ✗ FAIL: ${message}`);
  } else {
    testsPassed++;
    console.log(`  ✓ PASS: ${message}`);
  }
}

async function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    testsFailed++;
    failedTests.push(`${message} (expected: ${expected}, got: ${actual})`);
    console.error(`  ✗ FAIL: ${message}`);
    console.error(`    Expected: ${expected}`);
    console.error(`    Got: ${actual}`);
  } else {
    testsPassed++;
    console.log(`  ✓ PASS: ${message}`);
  }
}

async function assertNotNull(value, message) {
  if (value === null || value === undefined) {
    testsFailed++;
    failedTests.push(`${message} (value was null/undefined)`);
    console.error(`  ✗ FAIL: ${message}`);
  } else {
    testsPassed++;
    console.log(`  ✓ PASS: ${message}`);
  }
}

async function assertNull(value, message) {
  if (value !== null) {
    testsFailed++;
    failedTests.push(`${message} (value was not null)`);
    console.error(`  ✗ FAIL: ${message}`);
  } else {
    testsPassed++;
    console.log(`  ✓ PASS: ${message}`);
  }
}

// Test suite
async function runTests() {
  console.log('\n========================================');
  console.log('JWT Token Expiration Handling Tests');
  console.log('========================================\n');

  const testPayload = {
    userId: 'test-user-123',
    email: 'test@example.com',
    role: 'user',
  };

  // Test 1: Access Token Generation
  console.log('\n[Test Suite 1] Access Token Generation');
  const accessToken = await generateAccessToken(testPayload);
  assert(accessToken !== undefined, 'Access token generated');
  assert(typeof accessToken === 'string', 'Access token is a string');
  assert(accessToken.split('.').length === 3, 'Access token has JWT format (3 parts)');

  // Test 2: Access Token Verification
  console.log('\n[Test Suite 2] Access Token Verification');
  const verifiedAccess = await verifyAccessToken(accessToken);
  await assertNotNull(verifiedAccess, 'Valid access token verifies successfully');
  assert(verifiedAccess?.userId === testPayload.userId, 'Access token contains correct userId');
  assert(verifiedAccess?.email === testPayload.email, 'Access token contains correct email');
  assert(verifiedAccess?.role === testPayload.role, 'Access token contains correct role');
  assert(verifiedAccess?.iat !== undefined, 'Access token contains iat claim');
  assert(verifiedAccess?.exp !== undefined, 'Access token contains exp claim');

  // Test 3: Access Token Expiration Time
  console.log('\n[Test Suite 3] Access Token Expiration Time');
  const accessExpirationTime = (verifiedAccess?.exp || 0) - (verifiedAccess?.iat || 0);
  assert(
    accessExpirationTime >= 899 && accessExpirationTime <= 901,
    `Access token expiration is 15 minutes (${accessExpirationTime}s)`
  );

  // Test 4: Refresh Token Generation
  console.log('\n[Test Suite 4] Refresh Token Generation');
  const refreshToken = await generateRefreshToken(testPayload);
  assert(refreshToken !== undefined, 'Refresh token generated');
  assert(typeof refreshToken === 'string', 'Refresh token is a string');
  assert(refreshToken.split('.').length === 3, 'Refresh token has JWT format (3 parts)');
  assert(refreshToken !== accessToken, 'Refresh token differs from access token');

  // Test 5: Refresh Token Verification
  console.log('\n[Test Suite 5] Refresh Token Verification');
  const verifiedRefresh = await verifyRefreshToken(refreshToken);
  await assertNotNull(verifiedRefresh, 'Valid refresh token verifies successfully');
  assert(verifiedRefresh?.userId === testPayload.userId, 'Refresh token contains correct userId');
  assert(verifiedRefresh?.iat !== undefined, 'Refresh token contains iat claim');
  assert(verifiedRefresh?.exp !== undefined, 'Refresh token contains exp claim');

  // Test 6: Refresh Token Expiration Time
  console.log('\n[Test Suite 6] Refresh Token Expiration Time');
  const refreshExpirationTime = (verifiedRefresh?.exp || 0) - (verifiedRefresh?.iat || 0);
  assert(
    refreshExpirationTime >= 604799 && refreshExpirationTime <= 604801,
    `Refresh token expiration is 7 days (${refreshExpirationTime}s)`
  );

  // Test 7: Token Pair Generation
  console.log('\n[Test Suite 7] Token Pair Generation');
  const tokens = await generateTokens(testPayload);
  assert(tokens.accessToken !== undefined, 'Token pair includes access token');
  assert(tokens.refreshToken !== undefined, 'Token pair includes refresh token');
  assert(tokens.accessToken !== tokens.refreshToken, 'Access and refresh tokens are different');

  // Test 8: Invalid Token Format Handling
  console.log('\n[Test Suite 8] Invalid Token Format Handling');
  const consoleErrorSpy = [];
  const originalError = console.error;
  console.error = (...args) => consoleErrorSpy.push(args.join(' '));

  const invalidToken = 'invalid.token.format';
  const invalidResult = await verifyAccessToken(invalidToken);
  await assertNull(invalidResult, 'Invalid token format returns null');
  assert(consoleErrorSpy.length > 0, 'Invalid token format logs error');
  assert(
    consoleErrorSpy[0]?.includes('Access token verification failed'),
    'Error message indicates verification failure'
  );

  console.error = originalError;

  // Test 9: Malformed JWT Handling
  console.log('\n[Test Suite 9] Malformed JWT Handling');
  const malformedToken = 'not.a.jwt';
  const malformedResult = await verifyAccessToken(malformedToken);
  await assertNull(malformedResult, 'Malformed JWT returns null');

  // Test 10: Token Header Extraction
  console.log('\n[Test Suite 10] Token Header Extraction');
  const testToken = 'test-token-xyz';
  const bearerHeader = `Bearer ${testToken}`;
  const extracted = extractTokenFromHeader(bearerHeader);
  await assertEquals(extracted, testToken, 'Bearer token extracted correctly');

  const noHeader = extractTokenFromHeader(null);
  await assertNull(noHeader, 'Null header returns null');

  const basicHeader = extractTokenFromHeader('Basic dGVzdDp0ZXN0');
  await assertNull(basicHeader, 'Non-Bearer header returns null');

  const emptyHeader = extractTokenFromHeader('');
  await assertNull(emptyHeader, 'Empty header returns null');

  // Test 11: CRITICAL - Expired Access Token Error Logging
  console.log('\n[Test Suite 11] CRITICAL - Expired Access Token Error Logging');
  const { SignJWT } = await import('jose');
  const ACCESS_TOKEN_SECRET = new TextEncoder().encode(
    process.env.JWT_ACCESS_SECRET || 'test-access-secret-key-min-32-chars-long!'
  );

  const expiredAccessToken = await new SignJWT({ ...testPayload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(Math.floor(Date.now() / 1000) - 1000)
    .setExpirationTime('0s')
    .sign(ACCESS_TOKEN_SECRET);

  const errorLogs = [];
  console.error = (...args) => errorLogs.push(args.join(' '));

  const expiredResult = await verifyAccessToken(expiredAccessToken);
  await assertNull(expiredResult, 'Expired access token returns null');
  assert(
    errorLogs.length === 0,
    'CRITICAL: Expired access tokens do NOT log errors (silent handling)'
  );

  console.error = originalError;

  // Test 12: CRITICAL - Non-Expiration Errors Are Logged
  console.log('\n[Test Suite 12] CRITICAL - Non-Expiration Errors Are Logged');
  const errorLogs2 = [];
  console.error = (...args) => errorLogs2.push(args.join(' '));

  await verifyAccessToken('invalid.format');
  assert(
    errorLogs2.length > 0,
    'CRITICAL: Non-expiration errors ARE logged'
  );

  console.error = originalError;

  // Test 13: Admin Role Preservation
  console.log('\n[Test Suite 13] Admin Role Preservation');
  const adminPayload = {
    userId: 'admin-123',
    email: 'admin@example.com',
    role: 'admin',
  };

  const adminAccessToken = await generateAccessToken(adminPayload);
  const verifiedAdmin = await verifyAccessToken(adminAccessToken);
  assert(verifiedAdmin?.role === 'admin', 'Admin role preserved in access token');

  const adminRefreshToken = await generateRefreshToken(adminPayload);
  const verifiedAdminRefresh = await verifyRefreshToken(adminRefreshToken);
  assert(verifiedAdminRefresh?.role === 'admin', 'Admin role preserved in refresh token');

  // Summary
  console.log('\n========================================');
  console.log('Test Summary');
  console.log('========================================');
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);

  if (testsFailed > 0) {
    console.log('\nFailed Tests:');
    failedTests.forEach((test, index) => {
      console.log(`  ${index + 1}. ${test}`);
    });
    process.exit(1);
  } else {
    console.log('\nAll tests passed!');
    process.exit(0);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
