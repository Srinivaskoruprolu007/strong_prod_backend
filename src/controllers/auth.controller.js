import logger from "#config/logger.js";
import {signupSchema} from "#validations/auth.validation.js";
import {formatValidationError} from "#utils/format.js";
import {createUser} from "#services/auth.service.js";
import {jwttoken} from "#utils/jwt.js";
import {cookies} from "#utils/cookies.js";

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
        
        logger.info(`User signup successful`, { 
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
