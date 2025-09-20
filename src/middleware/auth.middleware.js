import logger from '#config/logger.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

/**
 * Authentication middleware to protect routes
 */
export const authenticate = (options = {}) => {
  return async (req, res, next) => {
    try {
      const { 
        optional = false,
        requireRefresh = false 
      } = options;

      let token;

      // Try to get token from cookies first, then Authorization header
      if (requireRefresh) {
        token = cookies.get(req, 'refreshToken');
      } else {
        token = cookies.get(req, 'token') || 
                        (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
                          ? req.headers.authorization.slice(7) 
                          : null);
      }

      if (!token) {
        if (optional) {
          return next();
        }
                
        logger.warn('Authentication failed: No token provided', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path
        });

        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Access token is required',
          timestamp: new Date().toISOString()
        });
      }

      // Verify token
      let decoded;
      try {
        decoded = requireRefresh 
          ? jwttoken.verifyRefresh(token)
          : jwttoken.verify(token);
      } catch (tokenError) {
        if (optional) {
          return next();
        }

        logger.warn('Authentication failed: Invalid token', {
          error: tokenError.message,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path
        });

        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
          message: tokenError.message,
          timestamp: new Date().toISOString()
        });
      }

      // Attach user info to request object
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        tokenType: decoded.type
      };

      logger.debug('User authenticated successfully', {
        userId: req.user.id,
        email: req.user.email,
        path: req.path
      });

      next();

    } catch (error) {
      logger.error('Authentication middleware error:', error);
            
      if (options.optional) {
        return next();
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Authentication process failed',
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Authorization middleware to check user roles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Authorization failed: No authenticated user');
            
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
        timestamp: new Date().toISOString()
      });
    }

    if (allowedRoles.length === 0) {
      // No specific roles required, just need to be authenticated
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Authorization failed: Insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path
      });

      return res.status(403).json({
        success: false,
        error: 'Access forbidden',
        message: 'You do not have permission to access this resource',
        timestamp: new Date().toISOString()
      });
    }

    logger.debug('User authorized successfully', {
      userId: req.user.id,
      userRole: req.user.role,
      path: req.path
    });

    next();
  };
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = authenticate({ optional: true });

/**
 * Refresh token authentication middleware
 */
export const authenticateRefresh = authenticate({ requireRefresh: true });