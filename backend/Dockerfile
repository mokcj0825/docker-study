# Build stage
FROM node:20-alpine

WORKDIR /app

# Install OpenSSL and other required dependencies for Prisma
RUN apk add --no-cache openssl

# Copy package files and prisma schema first
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client (in a separate layer)
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3001

# Start the application with proper initialization
CMD sh -c "npx prisma migrate deploy && npx prisma generate && npm run dev" 