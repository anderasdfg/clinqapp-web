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

EXPOSE 3001

# Run prisma migration or generate in production if needed
# For Cloud Run, we usually just start the app
CMD ["npm", "start"]
