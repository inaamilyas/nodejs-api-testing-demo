# Node.js API Testing Demo

A learning project focused on API testing using **Jest** and **Supertest** with a Node.js/Express backend and PostgreSQL database.

## 📚 Project Purpose

This project is designed to help you learn and practice:

- **API Testing with Jest**: Writing unit and integration tests for REST APIs
- **Supertest**: Testing HTTP endpoints without starting a server
- **Test Organization**: Structuring tests into unit and integration categories
- **Test Utilities**: Creating reusable test helpers and fixtures
- **Database Testing**: Testing with Prisma ORM and PostgreSQL
- **Authentication Testing**: Testing JWT-based authentication flows
- **Code Coverage**: Measuring and maintaining test coverage

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Testing Framework**: Jest
- **HTTP Testing**: Supertest
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs

## 📁 Project Structure

```
api-testing-app/
├── config/              # Configuration files
├── controllers/         # Route controllers
├── middleware/          # Express middleware (auth, etc.)
├── prisma/             # Database schema and migrations
├── routes/             # API route definitions
├── tests/              # Test files
│   ├── fixtures/       # Test data fixtures
│   ├── helpers/        # Test utility functions
│   ├── integration/    # Integration tests
│   ├── unit/           # Unit tests
│   │   └── controllers/ # Controller unit tests
│   └── setup.js        # Jest setup file
├── .env.example        # Environment variables template
├── index.js            # Application entry point
└── jest.config.js      # Jest configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository** (or navigate to the project directory):

   ```bash
   cd api-testing-app
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file**:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/api_testing_db?schema=public"
   JWT_ACCESS_SECRET=your-super-secret-access-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
   JWT_ACCESS_EXPIRATION=15m
   JWT_REFRESH_EXPIRATION=7d
   PORT=3000
   ```

5. **Create the database**:

   ```bash
   # Create a PostgreSQL database named 'api_testing_db'
   createdb api_testing_db
   ```

6. **Run Prisma migrations**:

   ```bash
   npx prisma migrate dev
   ```

7. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

## 🏃 Running the Application

### Start the development server:

```bash
node index.js
```

The server will start on `http://localhost:3000` (or the PORT specified in your `.env` file).

### Test the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

## 🧪 Running Tests

This project includes comprehensive test scripts to help you learn different testing approaches:

### Run all tests:

```bash
npm test
```

### Run tests in watch mode (for development):

```bash
npm run test:watch
```

### Run only unit tests:

```bash
npm run test:unit
```

### Run only integration tests:

```bash
npm run test:integration
```

### Run tests with coverage report:

```bash
npm run test:coverage
```

The coverage report will be generated in the `coverage/` directory. Open `coverage/lcov-report/index.html` in your browser to view detailed coverage information.

## 📖 Learning Resources

### Understanding the Tests

1. **Unit Tests** (`tests/unit/`):

   - Test individual functions and controllers in isolation
   - Mock external dependencies (database, services)
   - Fast execution, focused on logic

2. **Integration Tests** (`tests/integration/`):

   - Test complete API endpoints
   - Use real database connections (test database)
   - Verify end-to-end functionality

3. **Test Utilities** (`tests/helpers/`):

   - Reusable functions for common test operations
   - Database cleanup utilities
   - Token generation helpers

4. **Fixtures** (`tests/fixtures/`):
   - Predefined test data
   - Consistent data across tests
   - Easy to maintain and update

### Key Testing Concepts Demonstrated

- **Supertest**: Making HTTP requests to test API endpoints
- **Jest Mocking**: Mocking Prisma client and other dependencies
- **Test Setup/Teardown**: Using `beforeEach`, `afterEach`, `beforeAll`, `afterAll`
- **Assertions**: Testing responses, status codes, and data structures
- **Code Coverage**: Maintaining 80% coverage threshold
- **Test Isolation**: Ensuring tests don't affect each other

## 🎯 Coverage Thresholds

The project maintains the following coverage thresholds:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## 📝 API Endpoints

### Health Check

- **GET** `/health` - Check if the server is running

### Authentication

- **POST** `/api/auth/register` - Register a new user
- **POST** `/api/auth/login` - Login and receive JWT tokens
- **POST** `/api/auth/refresh` - Refresh access token
- **POST** `/api/auth/logout` - Logout and invalidate refresh token

## 🔧 Configuration

### Jest Configuration (`jest.config.js`)

- **Test Environment**: Node.js
- **Coverage Directory**: `coverage/`
- **Test Match Pattern**: `**/tests/**/*.test.js`
- **Setup File**: `tests/setup.js`
- **Coverage Collection**: Controllers, routes, middleware

## 🤝 Contributing

This is a learning project. Feel free to:

- Add more test cases
- Improve test coverage
- Add new features with tests
- Refactor existing code

## 📄 License

ISC

## 🎓 Next Steps

To continue learning:

1. Add more API endpoints and write tests for them
2. Experiment with different testing patterns
3. Try testing error scenarios and edge cases
4. Learn about test-driven development (TDD)
5. Explore advanced Jest features (snapshots, custom matchers)
6. Add end-to-end (E2E) tests
7. Implement CI/CD with automated testing

---

**Happy Testing! 🚀**
