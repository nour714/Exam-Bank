// tests/setup.js
// Global test setup for Jest

const { PrismaClient } = require('@prisma/client');

// Mock out the real Prisma Client globally for isolated unit tests,
// or provide a real connection to a test database if integration testing.
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  // Global Setup (e.g. initialize test DB connection)
});

afterAll(async () => {
  // Global Teardown
});
