import request from 'supertest';
import { app } from '../src/app.js';

describe('Authentication Endpoints', () => {
  
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('POST /api/v1/auth/sign-up', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: `test-${Date.now()}@example.com`,
        password: 'SecurePass123',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/v1/auth/sign-up')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Account created successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('email', userData.email);
      expect(response.body.data.user).toHaveProperty('name', userData.name);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should reject signup with invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'SecurePass123',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/v1/auth/sign-up')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject signup with weak password', async () => {
      const userData = {
        name: 'John Doe',
        email: `test-${Date.now()}@example.com`,
        password: '123', // Too weak
        role: 'user'
      };

      const response = await request(app)
        .post('/api/v1/auth/sign-up')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject signup with missing name', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'SecurePass123',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/v1/auth/sign-up')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('POST /api/v1/auth/sign-in', () => {
    const testUser = {
      name: 'Test User',
      email: `signin-test-${Date.now()}@example.com`,
      password: 'SecurePass123',
      role: 'user'
    };

    beforeAll(async () => {
      // Create a user for sign-in tests
      await request(app)
        .post('/api/v1/auth/sign-up')
        .send(testUser)
        .expect(201);
    });

    it('should sign in with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/sign-in')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Signed in successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
      
      // Check for authentication cookies
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject sign-in with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/sign-in')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePass123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Authentication failed');
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should reject sign-in with invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/sign-in')
        .send({
          email: testUser.email,
          password: 'WrongPassword123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Authentication failed');
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should reject sign-in with missing credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/sign-in')
        .send({
          email: testUser.email
          // Missing password
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('POST /api/v1/auth/sign-out', () => {
    it('should sign out successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/sign-out')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Signed out successfully');
    });
  });

  describe('GET /api', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('documentation');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});