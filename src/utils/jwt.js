import jwt from 'jsonwebtoken';
import logger from "#config/logger.js";

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Short-lived access token
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Validate JWT secrets on startup
if (!JWT_SECRET) {
    logger.error('JWT_SECRET is not defined in environment variables');
    throw new Error('JWT_SECRET is required for authentication');
}

if (!JWT_REFRESH_SECRET) {
    logger.warn('JWT_REFRESH_SECRET is not defined. Using JWT_SECRET for refresh tokens (not recommended for production)');
}

export const jwttoken = {
    /**
     * Generate access token
     */
    sign: (payload, options = {}) => {
        try {
            const tokenPayload = {
                ...payload,
                type: 'access',
                iat: Math.floor(Date.now() / 1000)
            };
            
            return jwt.sign(tokenPayload, JWT_SECRET, {
                expiresIn: JWT_EXPIRES_IN,
                issuer: 'strong-prod-backend',
                audience: 'strong-prod-frontend',
                ...options
            });
        } catch (error) {
            logger.error('Failed to sign JWT token:', error);
            throw new Error('Failed to generate authentication token');
        }
    },
    
    /**
     * Generate refresh token
     */
    signRefresh: (payload, options = {}) => {
        try {
            const tokenPayload = {
                id: payload.id,
                type: 'refresh',
                iat: Math.floor(Date.now() / 1000)
            };
            
            return jwt.sign(tokenPayload, JWT_REFRESH_SECRET || JWT_SECRET, {
                expiresIn: JWT_REFRESH_EXPIRES_IN,
                issuer: 'strong-prod-backend',
                audience: 'strong-prod-frontend',
                ...options
            });
        } catch (error) {
            logger.error('Failed to sign refresh token:', error);
            throw new Error('Failed to generate refresh token');
        }
    },
    
    /**
     * Verify access token
     */
    verify: (token) => {
        try {
            const decoded = jwt.verify(token, JWT_SECRET, {
                issuer: 'strong-prod-backend',
                audience: 'strong-prod-frontend'
            });
            
            if (decoded.type !== 'access') {
                throw new Error('Invalid token type');
            }
            
            return decoded;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token has expired');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            } else if (error.name === 'NotBeforeError') {
                throw new Error('Token not active yet');
            }
            
            logger.error('Failed to verify JWT token:', error);
            throw new Error('Token verification failed');
        }
    },
    
    /**
     * Verify refresh token
     */
    verifyRefresh: (token) => {
        try {
            const decoded = jwt.verify(token, JWT_REFRESH_SECRET || JWT_SECRET, {
                issuer: 'strong-prod-backend',
                audience: 'strong-prod-frontend'
            });
            
            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type');
            }
            
            return decoded;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Refresh token has expired');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid refresh token');
            }
            
            logger.error('Failed to verify refresh token:', error);
            throw new Error('Refresh token verification failed');
        }
    },
    
    /**
     * Decode token without verification (for debugging)
     */
    decode: (token) => {
        try {
            return jwt.decode(token, { complete: true });
        } catch (error) {
            logger.error('Failed to decode JWT token:', error);
            return null;
        }
    }
};
