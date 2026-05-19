# Build stage
FROM node:20 AS builder

WORKDIR /app

# Install dependencies for building
RUN apt-get update -y && apt-get install -y openssl ca-certificates

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (development included for build)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client and build (doesn't require real DB URLs)
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY start.sh ./

# Make start script executable
RUN chmod +x start.sh

EXPOSE 3001

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use startup script that validates environment and DB connection
CMD ["./start.sh"]
