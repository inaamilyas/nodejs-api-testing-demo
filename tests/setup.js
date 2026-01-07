require('dotenv').config();
const prisma = require('../config/database');

// Global setup before all tests
beforeAll(async () => {
  // Ensure we're in test environment
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests must be run with NODE_ENV=test');
  }
});

// Global teardown after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
