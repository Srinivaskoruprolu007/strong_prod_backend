# Deployment Guide

This guide covers deployment options for the Strong Production Backend.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL database (Neon recommended)

## Environment Configuration

### Development
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

### Production
Create `.env.production` with secure values:
```bash
# Server Configuration
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database
DATABASE_URL=your_secure_database_url

# JWT Secrets (generate strong secrets!)
JWT_SECRET=your_32_character_minimum_secret
JWT_REFRESH_SECRET=your_different_32_character_secret

# Domain and CORS
COOKIE_DOMAIN=yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Deployment Options

### 1. Docker Compose (Recommended)

#### Production
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Development
```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up

# Run in background
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Docker Only

```bash
# Build image
docker build -t strong-prod-backend .

# Run container
docker run -d \
  --name strong-backend \
  -p 3000:3000 \
  --env-file .env.production \
  strong-prod-backend
```

### 3. Cloud Platforms

#### AWS ECS
1. Push image to ECR
2. Create task definition
3. Create service with load balancer
4. Set environment variables in task definition

#### Google Cloud Run
```bash
# Build and push to Container Registry
docker build -t gcr.io/YOUR_PROJECT/strong-backend .
docker push gcr.io/YOUR_PROJECT/strong-backend

# Deploy to Cloud Run
gcloud run deploy strong-backend \
  --image gcr.io/YOUR_PROJECT/strong-backend \
  --platform managed \
  --port 3000 \
  --env-vars-file .env.production
```

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Set build command: `docker build`
3. Set run command: `npm start`
4. Configure environment variables
5. Set port to 3000

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### 4. Traditional VPS/Server

```bash
# Install Node.js and pm2
npm install -g pm2

# Clone repository
git clone your-repo-url
cd strong_prod_backend

# Install dependencies
npm ci --only=production

# Start with PM2
pm2 start src/index.js --name strong-backend
pm2 save
pm2 startup
```

## Database Setup

### Migration
```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate
```

### Neon Database
1. Create Neon project
2. Copy connection string
3. Add to DATABASE_URL environment variable

## SSL/TLS Configuration

### Reverse Proxy (Nginx)
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring

### Health Checks
- Endpoint: `GET /health`
- Returns server status, uptime, memory usage

### Logs
- Production: Files in `logs/` directory
- Development: Console output
- Docker: `docker logs container_name`

### CI/CD Pipeline
GitHub Actions automatically:
- Runs tests on push/PR
- Builds Docker images
- Publishes to GitHub Container Registry
- Deploys on tag creation

## Security Checklist

- [ ] Use strong JWT secrets (32+ characters)
- [ ] Configure CORS origins properly
- [ ] Set secure cookie domain
- [ ] Use HTTPS in production
- [ ] Enable rate limiting
- [ ] Run security scans
- [ ] Update dependencies regularly
- [ ] Use environment variables for secrets
- [ ] Enable logging and monitoring
- [ ] Configure firewall rules

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify DATABASE_URL
   - Check network connectivity
   - Ensure database is running

2. **JWT Errors**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure secrets match across instances

3. **CORS Issues**
   - Configure ALLOWED_ORIGINS
   - Check request headers
   - Verify domain configuration

4. **Rate Limiting**
   - Adjust rate limit settings
   - Check IP whitelisting
   - Monitor request patterns

### Performance Optimization

1. **Database**
   - Add database indexes
   - Use connection pooling
   - Monitor query performance

2. **Application**
   - Enable compression
   - Implement caching
   - Optimize middleware order
   - Use CDN for static assets

3. **Infrastructure**
   - Use load balancer
   - Configure auto-scaling
   - Monitor resource usage
   - Set up alerting

## Scaling

### Horizontal Scaling
- Deploy multiple instances
- Use load balancer
- Share session data (Redis)
- Database read replicas

### Vertical Scaling
- Increase CPU/RAM
- Optimize Node.js settings
- Tune garbage collection
- Profile application performance