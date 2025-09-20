const DEFAULT_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000 // 15 minutes default
};

const REFRESH_COOKIE_OPTIONS = {
    ...DEFAULT_COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
};

export const cookies = {
    /**
     * Get default cookie options
     */
    getOptions: (type = 'access') => {
        if (type === 'refresh') {
            return REFRESH_COOKIE_OPTIONS;
        }
        return DEFAULT_COOKIE_OPTIONS;
    },
    
    /**
     * Set a cookie with secure defaults
     */
    set: (res, name, value, options = {}) => {
        const cookieOptions = {
            ...DEFAULT_COOKIE_OPTIONS,
            ...options
        };
        
        // Additional security for production
        if (process.env.NODE_ENV === 'production') {
            cookieOptions.domain = process.env.COOKIE_DOMAIN; // Set your domain
            cookieOptions.secure = true;
        }
        
        res.cookie(name, value, cookieOptions);
    },
    
    /**
     * Set refresh token cookie with extended options
     */
    setRefresh: (res, name, value, options = {}) => {
        const cookieOptions = {
            ...REFRESH_COOKIE_OPTIONS,
            ...options
        };
        
        if (process.env.NODE_ENV === 'production') {
            cookieOptions.domain = process.env.COOKIE_DOMAIN;
            cookieOptions.secure = true;
        }
        
        res.cookie(name, value, cookieOptions);
    },
    
    /**
     * Clear a cookie
     */
    clear: (res, name, options = {}) => {
        const cookieOptions = {
            ...DEFAULT_COOKIE_OPTIONS,
            maxAge: 0,
            expires: new Date(0),
            ...options
        };
        
        if (process.env.NODE_ENV === 'production') {
            cookieOptions.domain = process.env.COOKIE_DOMAIN;
        }
        
        res.clearCookie(name, cookieOptions);
    },
    
    /**
     * Get a cookie value from request
     */
    get: (req, name) => {
        return req.cookies?.[name] || null;
    },
    
    /**
     * Clear all authentication cookies
     */
    clearAuth: (res) => {
        cookies.clear(res, 'token');
        cookies.clear(res, 'refreshToken');
    }
};
