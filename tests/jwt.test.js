import { jwttoken } from '../src/utils/jwt.js';

describe('JWT Utilities', () => {
  const testPayload = {
    id: 1,
    email: 'test@example.com',
    role: 'user'
  };

  describe('Token Generation', () => {
    it('should generate access token', () => {
      const token = jwttoken.sign(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should generate refresh token', () => {
      const token = jwttoken.signRefresh({ id: testPayload.id });
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });
  });

  describe('Token Verification', () => {
    let accessToken;
    let refreshToken;

    beforeAll(() => {
      accessToken = jwttoken.sign(testPayload);
      refreshToken = jwttoken.signRefresh({ id: testPayload.id });
    });

    it('should verify valid access token', () => {
      const decoded = jwttoken.verify(accessToken);
      expect(decoded).toMatchObject({
        id: testPayload.id,
        email: testPayload.email,
        role: testPayload.role,
        type: 'access'
      });
    });

    it('should verify valid refresh token', () => {
      const decoded = jwttoken.verifyRefresh(refreshToken);
      expect(decoded).toMatchObject({
        id: testPayload.id,
        type: 'refresh'
      });
    });

    it('should reject invalid token', () => {
      expect(() => {
        jwttoken.verify('invalid.token.here');
      }).toThrow('Invalid token');
    });

    it('should reject expired token', () => {
      const shortToken = jwttoken.sign(testPayload, { expiresIn: '1ms' });
      
      // Wait for token to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(() => {
            jwttoken.verify(shortToken);
          }).toThrow('Token has expired');
          resolve();
        }, 10);
      });
    });

    it('should reject access token as refresh token', () => {
      expect(() => {
        jwttoken.verifyRefresh(accessToken);
      }).toThrow('Invalid token type');
    });

    it('should reject refresh token as access token', () => {
      expect(() => {
        jwttoken.verify(refreshToken);
      }).toThrow('Invalid token type');
    });
  });

  describe('Token Decoding', () => {
    it('should decode token without verification', () => {
      const token = jwttoken.sign(testPayload);
      const decoded = jwttoken.decode(token);
      
      expect(decoded).toHaveProperty('header');
      expect(decoded).toHaveProperty('payload');
      expect(decoded.payload).toMatchObject({
        id: testPayload.id,
        email: testPayload.email,
        role: testPayload.role,
        type: 'access'
      });
    });

    it('should return null for invalid token during decode', () => {
      const decoded = jwttoken.decode('invalid.token');
      expect(decoded).toBeNull();
    });
  });
});