const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');
const prisma = require('../../config/database');
const {
  cleanDatabase,
  createTestUser,
  generateRefreshToken,
  createRefreshToken,
} = require('../helpers/testUtils');
const { validUser, validUser2 } = require('../fixtures/userFixtures');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes - Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(validUser)
        .expect(201);

      expect(response.body).toHaveProperty(
        'message',
        'User created successfully',
      );
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', validUser.email);
      expect(response.body.user).toHaveProperty('name', validUser.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ password: 'password123', name: 'Test User' })
        .expect(400);

      expect(response.body).toHaveProperty(
        'error',
        'Email, password, and name are required',
      );
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', name: 'Test User' })
        .expect(400);

      expect(response.body).toHaveProperty(
        'error',
        'Email, password, and name are required',
      );
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(400);

      expect(response.body).toHaveProperty(
        'error',
        'Email, password, and name are required',
      );
    });

    it('should return 409 if user already exists', async () => {
      await createTestUser(validUser);

      const response = await request(app)
        .post('/api/auth/signup')
        .send(validUser)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestUser(validUser);
    });

    it('should login user successfully and return tokens', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', validUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' })
        .expect(400);

      expect(response.body).toHaveProperty(
        'error',
        'Email and password are required',
      );
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty(
        'error',
        'Email and password are required',
      );
    });

    it('should return 401 if email is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'password123' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 401 if password is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'wrongpassword' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken, refreshToken, user;

    beforeEach(async () => {
      user = await createTestUser(validUser);

      // Login to get tokens
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      accessToken = loginResponse.body.accessToken;
      refreshToken = loginResponse.body.refreshToken;
    });

    it('should logout user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logout successful');

      // Verify refresh token is removed from database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });
      expect(storedToken).toBeNull();
    });

    it('should return 401 if no access token provided', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should return 400 if refresh token is missing', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Refresh token required');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let user, refreshToken;

    beforeEach(async () => {
      user = await createTestUser(validUser);
      refreshToken = generateRefreshToken(user.id);
      await createRefreshToken(user.id, refreshToken);
    });

    it('should refresh access token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
    });

    it('should return 400 if refresh token is missing', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Refresh token required');
    });

    it('should return 403 if refresh token is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalidtoken' })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid refresh token');
    });

    it('should return 403 if refresh token is not in database', async () => {
      // Create a different user and generate their token (but don't store it)
      const user2 = await createTestUser(validUser2);
      const validButNotStoredToken = generateRefreshToken(user2.id);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: validButNotStoredToken })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid refresh token');

      // Clean up the second user
      await prisma.user.delete({ where: { id: user2.id } });
    });
  });

  describe('Complete Authentication Flow', () => {
    it('should complete full signup -> login -> refresh -> logout flow', async () => {
      // 1. Signup
      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send(validUser2)
        .expect(201);

      expect(signupResponse.body.user).toHaveProperty(
        'email',
        validUser2.email,
      );

      // 2. Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser2.email, password: validUser2.password })
        .expect(200);

      const { accessToken, refreshToken } = loginResponse.body;
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();

      // 3. Refresh token
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      const newAccessToken = refreshResponse.body.accessToken;
      expect(newAccessToken).toBeDefined();

      // 4. Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(logoutResponse.body).toHaveProperty(
        'message',
        'Logout successful',
      );

      // 5. Verify refresh token no longer works
      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(403);
    });
  });
});
