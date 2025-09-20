import express from 'express';
import logger from "#config/logger.js";
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import authRouter from "#routes/auth.routes.js";

export const app = express();

// Trust proxy for rate limiting and security headers
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false, // Allow embedding if needed
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Compression middleware
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6,
    threshold: 1024,
}));

// CORS with specific configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['set-cookie'],
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 15 * 60 // 15 minutes in seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health check
        return req.path === '/health';
    },
});
app.use(limiter);

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
    skip: (req) => req.path === '/health' // Skip logging health checks
}));

// health route with more comprehensive health check
app.get('/health', async (req, res) => {
    const healthcheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        },
        environment: process.env.NODE_ENV || 'development'
    };

    try {
        // You can add database health check here if needed
        // const dbCheck = await db.select().from(users).limit(1);
        res.status(200).json(healthcheck);
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
            ...healthcheck,
            status: 'ERROR',
            error: 'Service unavailable'
        });
    }
});

app.get('/api', (req, res) => {
    res.status(200).json({
        message: 'Strong Production Backend API is running',
        version: '1.0.0',
        documentation: '/api/docs' // placeholder for future API docs
    });
});

// API routes
app.use('/api/v1/auth', authRouter);

// 404 handler for unknown routes
app.use('*', (req, res) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        timestamp: new Date().toISOString()
    });
});

// Global error handling middleware
app.use((error, req, res, next) => {
    logger.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Don't expose error details in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    res.status(error.status || 500).json({
        error: 'Internal Server Error',
        message: isDevelopment ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString(),
        ...(isDevelopment && { stack: error.stack })
    });
});

