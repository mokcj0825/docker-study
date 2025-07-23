# No-Docker-compose Development Guide

## 🚀 Local Development Setup (No `docker-compose`)

If you prefer to run everything locally without `docker-compose`, here's how to set it up:

## Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v16 or higher)
- **npm** or **yarn**

## Quick Start

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

#### Option A: Start Everything Together
```bash
# From project root
npm run dev:local
```

#### Option B: Start Individually
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

### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Kill the process
taskkill /PID <process_id> /F
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection
psql -h localhost -U postgres -d docker_study
```

### Prisma Issues
```bash
# Reset Prisma
cd backend
npx prisma generate
npx prisma db push
```

## Advantages of Local Development

✅ **Faster startup times**
✅ **Direct file system access**
✅ **Easier debugging**
✅ **No Docker overhead**
✅ **Familiar development workflow**

## Disadvantages

❌ **Environment differences between developers**
❌ **"Works on my machine" problems**
❌ **Manual setup required**
❌ **Different from production environment**

## When to Use Local vs Docker

### Use Local Development When:
- Quick prototyping
- Debugging complex issues
- Working offline
- Limited system resources

### Use Docker When:
- Team development
- Ensuring environment consistency
- Production-like testing
- CI/CD pipelines

## Migration Between Local and Docker

### From Local to Docker
```bash
# Stop local services
# Then run:
npm run dev
```

### From Docker to Local
```bash
# Stop Docker services
npm run docker:down

# Then follow local setup above
```

---

**Choose the approach that works best for your workflow!** 🎯
