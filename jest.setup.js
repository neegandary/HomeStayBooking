// jest.setup.js
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-min-32-chars-long!'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-min-32-chars-long!'
process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
