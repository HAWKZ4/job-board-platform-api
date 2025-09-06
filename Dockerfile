# ===========================
# Base stage
# ===========================
FROM node:22.9.0-alpine AS base

# Set working directory
WORKDIR /usr/src/app

# Copy only package.json and lock file first (better caching)
COPY package*.json ./
COPY tsconfig*.json ./

# Install deps (cache layer as long as package.json doesn’t change)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# ===========================
# Development stage
# ===========================
FROM base AS development

# Run in watch mode (no need for global Nest CLI)
CMD ["npm", "run", "start:dev"]

# ===========================
# Production stage
# ===========================
FROM node:22.9.0-alpine AS production

WORKDIR /usr/src/app

# Copy package.json + lock file and install only production deps
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy compiled output from base stage
COPY --from=base /usr/src/app/dist ./dist

# Expose API port
EXPOSE 3000

# Run production server
CMD ["node", "dist/main"]