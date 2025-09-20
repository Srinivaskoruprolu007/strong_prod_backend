# Strong Production Backend

A robust, production-ready Node.js backend application built with Express, featuring comprehensive security, logging, authentication, and performance optimizations.

## 🚀 Features

### Core Features
- **Express.js** - Fast, minimalist web framework
- **Drizzle ORM** - Type-safe database operations with Neon PostgreSQL
- **JWT Authentication** - Secure token-based authentication with refresh tokens
- **Role-based Authorization** - Flexible user role management
- **Input Validation** - Comprehensive request validation using Zod

### Security & Performance
- **Rate Limiting** - API rate limiting to prevent abuse
- **CORS Configuration** - Environment-specific CORS settings
- **Helmet Security** - Security headers and CSP policies
- **Compression** - Gzip/Deflate response compression
- **Cookie Security** - Secure, httpOnly cookies with environment-based settings

### Logging & Monitoring
- **Winston Logging** - Structured logging with file rotation
- **Health Check Endpoint** - Comprehensive application health monitoring
- **Error Handling** - Global error handling with environment-aware responses
- **Request Logging** - Detailed request logging with filtering

## 📋 Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database (Neon recommended)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Srinivaskoruprolu007/strong_prod_backend.git
   cd strong_prod_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your environment variables:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   LOG_LEVEL=info
   
   # Database Configuration
   DATABASE_URL=your_neon_database_url_here
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
   JWT_REFRESH_SECRET=your_refresh_secret_different_from_above
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   ```

4. **Generate and run database migrations**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

## 🏃‍♂️ Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Database Operations
```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

## 📡 API Endpoints

### Health Check
- **GET** `/health` - Application health status

### Authentication
- **POST** `/api/v1/auth/sign-up` - User registration
- **POST** `/api/v1/auth/sign-in` - User login (coming soon)
- **POST** `/api/v1/auth/sign-out` - User logout (coming soon)

### Example Signup Request
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "user"
}
```

## 🏗️ Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.js   # Database connection and configuration
│   └── logger.js     # Winston logging configuration
├── controllers/      # Route controllers
│   └── auth.controller.js
├── middleware/       # Custom middleware
│   └── auth.middleware.js
├── models/          # Database models
│   └── user.model.js
├── routes/          # Route definitions
│   └── auth.routes.js
├── services/        # Business logic
│   └── auth.service.js
├── utils/           # Utility functions
│   ├── cookies.js   # Cookie management utilities
│   ├── format.js    # Data formatting utilities
│   └── jwt.js       # JWT token utilities
├── validations/     # Input validation schemas
│   └── auth.validation.js
├── app.js          # Express application setup
├── index.js        # Application entry point
└── server.js       # Server startup
```

## 🔒 Security Features

### Authentication & Authorization
- JWT tokens with configurable expiry
- Refresh token rotation
- Role-based access control
- Secure password hashing (bcrypt, 12 rounds)

### Security Headers & Middleware
- Helmet.js for security headers
- CORS with environment-specific origins
- Rate limiting (100 req/15min in production)
- Request body size limits (10MB)

### Input Validation
- Comprehensive request validation
- Password strength requirements
- Email format validation
- Role validation with enums

## 📊 Monitoring & Logging

### Health Check Endpoint
The `/health` endpoint provides comprehensive application status:
- Server uptime
- Memory usage
- Environment information
- Database connection status

### Logging Levels
- **Error** - Application errors and exceptions
- **Warn** - Warning messages and suspicious activities
- **Info** - General application information
- **Debug** - Detailed debugging information (development only)

### Log Files
- `logs/error.log` - Error-level logs
- `logs/combined.log` - All logs
- `logs/exceptions.log` - Uncaught exceptions
- `logs/rejections.log` - Unhandled promise rejections

## 🌍 Environment Configuration

### Development
- Console logging enabled
- Detailed error responses
- Database query logging
- Relaxed CORS settings

### Production
- File-based logging with rotation
- Sanitized error responses
- Secure cookie settings
- Strict CORS configuration

## 🧪 Testing

Health check test:
```bash
curl http://localhost:3000/health
```

Signup test:
```bash
curl -X POST http://localhost:3000/api/v1/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "password": "TestPass123"
  }'
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Repository](https://github.com/Srinivaskoruprolu007/strong_prod_backend)
- [Issues](https://github.com/Srinivaskoruprolu007/strong_prod_backend/issues)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Express.js Documentation](https://expressjs.com/)

## 📚 Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Zod
- **Logging**: Winston
- **Security**: Helmet, bcrypt
- **Development**: ESLint, Prettier