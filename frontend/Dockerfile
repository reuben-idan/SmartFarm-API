# Build stage
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.10.0 --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy project files
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM nginx:stable-alpine as production

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

# Development stage
FROM node:18-alpine as development

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.10.0 --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy project files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start development server
CMD ["pnpm", "run", "dev", "--host"]

# Test stage
FROM node:18-alpine as test

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.10.0 --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy project files
COPY . .

# Run tests
CMD ["pnpm", "run", "test:ci"]
