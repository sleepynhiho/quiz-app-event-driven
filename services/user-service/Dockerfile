FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for Prisma)
RUN npm install

# Copy source code
COPY . .

# Install netcat, wget, and OpenSSL for scripts, health checks, and Prisma
RUN apt-get update && apt-get install -y netcat-openbsd wget openssl && rm -rf /var/lib/apt/lists/*

# Generate Prisma client
RUN npx prisma generate

# Make startup script executable
RUN chmod +x scripts/start.sh

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["./scripts/start.sh"] 