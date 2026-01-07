const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  signup,
  login,
  logout,
  refresh,
} = require('../../../controllers/authController');
const prisma = require('../../../config/database');

// Mock Prisma client
jest.mock('../../../config/database', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    deleteMany: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock bcrypt
jest.mock('bcryptjs');

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('Auth Controller - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
      };

      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      prisma.user.create.mockResolvedValue(mockUser);

      await signup(req, res);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User created successfully',
        user: mockUser,
      });
    });

    it('should return 400 if email is missing', async () => {
      req.body = {
        password: 'password123',
        name: 'Test User',
      };

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email, password, and name are required',
      });
    });

    it('should return 400 if password is missing', async () => {
      req.body = {
        email: 'test@example.com',
        name: 'Test User',
      };

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email, password, and name are required',
      });
    });

    it('should return 400 if name is missing', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email, password, and name are required',
      });
    });

    it('should return 409 if user already exists', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      prisma.user.findUnique.mockResolvedValue({ id: '123' });

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User already exists',
      });
    });

    it('should return 500 on server error', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
    });
  });

  describe('login', () => {
    it('should login user successfully and return tokens', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');
      prisma.refreshToken.create.mockResolvedValue({});

      await login(req, res);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
        },
      });
    });

    it('should return 400 if email is missing', async () => {
      req.body = {
        password: 'password123',
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email and password are required',
      });
    });

    it('should return 400 if password is missing', async () => {
      req.body = {
        email: 'test@example.com',
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email and password are required',
      });
    });

    it('should return 401 if user not found', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      prisma.user.findUnique.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      });
    });

    it('should return 401 if password is invalid', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      });
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      req.body = {
        refreshToken: 'validRefreshToken',
      };

      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await logout(req, res);

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'validRefreshToken' },
      });
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logout successful',
      });
    });

    it('should return 400 if refresh token is missing', async () => {
      req.body = {};

      await logout(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Refresh token required',
      });
    });
  });

  describe('refresh', () => {
    it('should refresh access token successfully', async () => {
      req.body = {
        refreshToken: 'validRefreshToken',
      };

      const mockStoredToken = {
        id: '123',
        token: 'validRefreshToken',
        userId: 'user123',
        expiresAt: new Date(Date.now() + 86400000),
        user: {
          id: 'user123',
          email: 'test@example.com',
        },
      };

      jwt.verify.mockReturnValue({ userId: 'user123' });
      prisma.refreshToken.findUnique.mockResolvedValue(mockStoredToken);
      jwt.sign.mockReturnValue('newAccessToken');

      await refresh(req, res);

      expect(jwt.verify).toHaveBeenCalledWith(
        'validRefreshToken',
        process.env.JWT_REFRESH_SECRET,
      );
      expect(res.json).toHaveBeenCalledWith({
        accessToken: 'newAccessToken',
      });
    });

    it('should return 400 if refresh token is missing', async () => {
      req.body = {};

      await refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Refresh token required',
      });
    });

    it('should return 403 if refresh token is not in database', async () => {
      req.body = {
        refreshToken: 'invalidRefreshToken',
      };

      jwt.verify.mockReturnValue({ userId: 'user123' });
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid refresh token',
      });
    });

    it('should return 403 if refresh token is expired', async () => {
      req.body = {
        refreshToken: 'expiredRefreshToken',
      };

      const mockStoredToken = {
        id: '123',
        token: 'expiredRefreshToken',
        userId: 'user123',
        expiresAt: new Date(Date.now() - 86400000), // Expired
        user: {
          id: 'user123',
          email: 'test@example.com',
        },
      };

      jwt.verify.mockReturnValue({ userId: 'user123' });
      prisma.refreshToken.findUnique.mockResolvedValue(mockStoredToken);
      prisma.refreshToken.delete.mockResolvedValue({});

      await refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Refresh token expired',
      });
    });
  });
});
