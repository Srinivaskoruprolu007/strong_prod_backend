import logger from '#config/logger.js';
import { signupSchema, signinSchema } from '#validations/auth.validation.js';
import { formatValidationError } from '#utils/format.js';
import { 
  createUser, 
  findUserByEmail, 
  findUserById, 
  verifyPassword,
  updateUserProfile 
} from '#services/auth.service.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

export const signup = async (req, res, next) => {
  try {
    // Validate request body
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
        timestamp: new Date().toISOString()
      });
    }
        
    const { email, name, role, password } = validationResult.data;
        
    // Create user
    const user = await createUser({ email, name, role, password });
        
    // Generate JWT token
    const token = jwttoken.sign({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });
        
    // Set secure cookie
    cookies.set(res, 'token', token, {
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
        
    logger.info('User signup successful', { 
      userId: user.id, 
      email: user.email,
      ip: req.ip 
    });
        
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at
        }
      },
      timestamp: new Date().toISOString()
    });
        
  } catch (error) {
    logger.error('Signup error:', { 
      error: error.message, 
      email: req.body?.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
        
    if (error.message.includes('User with email') && error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'An account with this email already exists',
        timestamp: new Date().toISOString()
      });
    }
        
    // Pass to global error handler
    next(error);
  }
};

/**
 * Sign-in controller
 */
export const signin = async (req, res, next) => {
  try {
    // Validate request body
    const validationResult = signinSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
        timestamp: new Date().toISOString()
      });
    }
        
    const { email, password } = validationResult.data;
        
    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      logger.warn('Sign-in attempt with non-existent email', {
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
            
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }
        
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Sign-in attempt with invalid password', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
            
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }
        
    // Generate tokens
    const accessToken = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role
    });
        
    const refreshToken = jwttoken.signRefresh({
      id: user.id
    });
        
    // Set secure cookies
    cookies.set(res, 'token', accessToken, {
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
        
    cookies.setRefresh(res, 'refreshToken', refreshToken);
        
    logger.info('User signed in successfully', {
      userId: user.id,
      email: user.email,
      ip: req.ip
    });
        
    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      timestamp: new Date().toISOString()
    });
        
  } catch (error) {
    logger.error('Sign-in error:', {
      error: error.message,
      email: req.body?.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
        
    next(error);
  }
};

/**
 * Sign-out controller
 */
export const signout = async (req, res, next) => {
  try {
    // Clear authentication cookies
    cookies.clearAuth(res);
        
    logger.info('User signed out', {
      userId: req.user?.id,
      email: req.user?.email,
      ip: req.ip
    });
        
    res.status(200).json({
      success: true,
      message: 'Signed out successfully',
      timestamp: new Date().toISOString()
    });
        
  } catch (error) {
    logger.error('Sign-out error:', error);
    next(error);
  }
};

/**
 * Refresh token controller
 */
export const refreshToken = async (req, res, next) => {
  try {
    // The authenticateRefresh middleware will validate the refresh token
    // and attach user info to req.user
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }
        
    // Generate new access token
    const accessToken = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role
    });
        
    // Set new access token cookie
    cookies.set(res, 'token', accessToken, {
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
        
    logger.info('Token refreshed successfully', {
      userId: user.id,
      email: user.email,
      ip: req.ip
    });
        
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      timestamp: new Date().toISOString()
    });
        
  } catch (error) {
    logger.error('Token refresh error:', error);
    next(error);
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User profile not found',
        timestamp: new Date().toISOString()
      });
    }
        
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user
      },
      timestamp: new Date().toISOString()
    });
        
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
        
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Name is required and must be at least 2 characters long',
        timestamp: new Date().toISOString()
      });
    }
        
    const updatedUser = await updateUserProfile(req.user.id, {
      name: name.trim()
    });
        
    logger.info('User profile updated', {
      userId: req.user.id,
      updates: { name: name.trim() },
      ip: req.ip
    });
        
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      },
      timestamp: new Date().toISOString()
    });
        
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};
