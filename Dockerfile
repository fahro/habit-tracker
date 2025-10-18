# Railway Production Dockerfile
# Optimized multi-stage build for Railway deployment

# Build stage
FROM node:18-alpine AS builder

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:18-alpine

# Install runtime dependencies AND build tools for better-sqlite3
RUN apk add --no-cache \
    sqlite \
    dumb-init \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies (better-sqlite3 needs to compile)
RUN npm install --production && \
    npm cache clean --force

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Copy backend code
COPY server ./server

# Create directory for database with proper permissions
RUN mkdir -p /app/data && \
    chown -R node:node /app

# Use non-root user for security
USER node

# Railway sets PORT environment variable
# We ensure the app listens on 0.0.0.0 to be accessible
ENV NODE_ENV=production

# Health check for Railway
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+process.env.PORT+'/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start server
CMD ["node", "server/index.js"]
