const jwt = require('jsonwebtoken');
const prisma = require('../../config/database');

/**
 * Clean up database tables
 */
const cleanDatabase = async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
};

/**
 * Generate access token for testing
 */
const generateAccessToken = (userId, email) => {
  return jwt.sign({ userId, email }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION,
  });
};

/**
 * Generate refresh token for testing
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION,
  });
};

/**
 * Create a test user in the database
 */
const createTestUser = async (userData = {}) => {
  const bcrypt = require('bcryptjs');
  const defaultData = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  };

  const data = { ...defaultData, ...userData };
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
  });
};

/**
 * Create a refresh token in the database
 */
const createRefreshToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
};

module.exports = {
  cleanDatabase,
  generateAccessToken,
  generateRefreshToken,
  createTestUser,
  createRefreshToken,
};
