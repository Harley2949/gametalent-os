FROM node:20-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
copy pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm --filter @gametalent/db run generate

# Build the application
RUN pnpm --filter @gametalent/api run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install dependencies for production
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY pnpm-lock.yaml* ./

RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=base /app/apps/api/dist ./dist
COPY --from=base /app/apps/api/node_modules ./node_modules
COPY --from=base /app/packages/db ./packages/db
COPY --from=base /app/node_modules ./node_modules

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/main"]
