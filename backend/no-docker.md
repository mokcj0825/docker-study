# No-Docker Development Guide

## Local development setup (no Docker)

## Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v16 or higher)
- **npm** or **yarn**

## Setup

### 1. Install Dependencies

```bash
# Install all dependencies
npm run install:all
```

### 2. Set Up Database

```bash
# Start PostgreSQL locally
# (Make sure PostgreSQL is running on localhost:5432)

# Create database
createdb docker_study

# Or use psql
psql -U postgres -c "CREATE DATABASE docker_study;"
```

### 3. Configure Environment

Create `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/docker_study"
NODE_ENV=development
```

### 4. Set Up Database Schema

```bash
cd backend

# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 5. Start Services

#### Option A: Start together
```bash
# From project root
npm run dev:local
```

#### Option B: Start individually
```bash
# Terminal 1: Start backend
cd backend
npm run dev:local

# Terminal 2: Start frontend  
cd frontend
npm run dev:local
```

## Service URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432

## How npm run dev works

The `npm run dev` command in this repository uses a custom setup script that orchestrates the entire development environment. Here's how it works:

### Setup script execution

The main `npm run dev` command runs `scripts/dev-setup.js`, which performs the following steps:

1. **Docker verification**: Checks if Docker is installed and running
2. **Dependency installation**: Installs all dependencies if not present
3. **Docker services startup**: Starts all services defined in `docker-compose.yml`
4. **Database readiness**: Waits for PostgreSQL to be healthy
5. **Schema setup**: Pushes Prisma schema to the database
6. **Prisma client generation**: Generates the Prisma client
7. **Service health checks**: Verifies backend and frontend are responding
8. **Log streaming**: Starts real-time log monitoring

### Docker services

The setup script manages three main services:

- **Frontend**: React application with Vite (port 5173)
- **Backend**: Node.js API with Express (port 3001)  
- **Database**: PostgreSQL database (port 5433)

### Health monitoring

The script includes health checks for each service:
- Database: Uses `pg_isready` to verify PostgreSQL is accepting connections
- Backend: Checks HTTP response on `/health` endpoint
- Frontend: Verifies the application is serving on port 5173

### Automatic restart

The script handles shutdown with Ctrl+C and automatically stops all Docker services when terminated.

## Database Management

```bash
# Open Prisma Studio
cd backend
npx prisma studio

# Reset database
npx prisma migrate reset --force

# Create new migration
npx prisma migrate dev --name your_migration_name
```

## Troubleshooting

### Port already in use
```bash
# Check what is using the port
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Terminate the process
taskkill /PID <process_id> /F
```

### Database connection issues
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection
psql -h localhost -U postgres -d docker_study
```

### Prisma issues
```bash
# Reset Prisma
cd backend
npx prisma generate
npx prisma db push
```

## Advantages of local development

- Lower startup time
- Access to the local file system
- Local debugging
- No Docker dependency
- Local development workflow

## Disadvantages

- Inconsistent environments across developers
- Machine-specific issues
- Manual setup
- Differences from the production environment

## When to use local vs Docker

### Use local development when:
- Prototyping
- Debugging
- Offline work
- Resource constraints

### Use Docker when:
- Team development
- Environment consistency
- Testing in a production-like environment
- CI/CD pipelines

## Migration between local and Docker

### From local to Docker
```bash
# Stop local services
# Then run:
npm run dev
```

### From Docker to local
```bash
# Stop Docker services
npm run docker:down

# Then follow local setup above
```
