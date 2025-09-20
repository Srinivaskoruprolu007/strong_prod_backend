import express from 'express';
import {
  signup,
  signin,
  signout,
  refreshToken,
  getProfile,
  updateProfile
} from '#controllers/auth.controller.js';
import { authenticate, authenticateRefresh, optionalAuth } from '#middleware/auth.middleware.js';

const authRouter = express.Router();

// Public routes (no authentication required)
authRouter.post('/sign-up', signup);
authRouter.post('/sign-in', signin);

// Token refresh route (requires refresh token)
authRouter.post('/refresh', authenticateRefresh, refreshToken);

// Protected routes (require authentication)
authRouter.post('/sign-out', optionalAuth, signout); // Optional auth to allow graceful signout
authRouter.get('/profile', authenticate(), getProfile);
authRouter.put('/profile', authenticate(), updateProfile);

// Admin only routes (example for future use)
// authRouter.get('/users', authenticate(), authorize('admin'), getAllUsers);

export default authRouter;
