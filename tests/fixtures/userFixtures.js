/**
 * User test fixtures
 */

const validUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
};

const validUser2 = {
  email: 'test2@example.com',
  password: 'password456',
  name: 'Test User 2',
};

const invalidUser = {
  email: 'invalid-email',
  password: '123',
  name: '',
};

const userWithoutEmail = {
  password: 'password123',
  name: 'Test User',
};

const userWithoutPassword = {
  email: 'test@example.com',
  name: 'Test User',
};

const userWithoutName = {
  email: 'test@example.com',
  password: 'password123',
};

module.exports = {
  validUser,
  validUser2,
  invalidUser,
  userWithoutEmail,
  userWithoutPassword,
  userWithoutName,
};
