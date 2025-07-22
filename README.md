# Docker Study Project

A full-stack development environment demonstrating Docker containerization with React frontend, Node.js backend, and PostgreSQL database.

## 🚀 Quick Start - The Magical Way

**Just one command to rule them all:**

```bash
npm run dev
```

That's it! This magical command will:
- ✅ Check if Docker is running
- ✅ Install all dependencies automatically
- ✅ Start all Docker services (frontend, backend, database)
- ✅ Set up the database schema with Prisma
- ✅ Generate Prisma client
- ✅ Wait for all services to be ready
- ✅ Show you all the URLs and useful commands
- ✅ Stream logs from all services

## 🎯 What You Get

After running `npm run dev`, you'll have:

- **Frontend**: http://localhost:5173 (React + TypeScript + Vite)
- **Backend API**: http://localhost:3001 (Node.js + Express + TypeScript)
- **Database**: localhost:5432 (PostgreSQL with Prisma ORM)

## 🔧 Alternative Commands

### From Project Root
```bash
# Start everything (recommended)
npm run dev

# Start only backend with Docker
npm run dev:backend

# Start only frontend with Docker
npm run dev:frontend

# Start everything locally (no Docker)
npm run dev:local

# Stop all Docker services
npm run docker:down

# View logs
npm run docker:logs

# Clean up everything
npm run clean
```

### From Individual Directories
```bash
# Backend directory
cd backend
npm run dev          # Start with Docker
npm run dev:local    # Start locally

# Frontend directory
cd frontend
npm run dev          # Start with Docker
npm run dev:local    # Start locally
```

## 🛠️ Manual Setup (If You Prefer)

If you want to understand what's happening under the hood:

### 1. Start Docker Services
```bash
docker-compose up --build
```

### 2. Set Up Database
```bash
# Push schema to database
docker-compose exec backend npx prisma db push

# Generate Prisma client
docker-compose exec backend npx prisma generate
```

### 3. Access Services
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Database: localhost:5432

## 📁 Project Structure

```
docker-study/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Node.js + Express + TypeScript
├── docker-compose.yml # Docker orchestration
├── package.json       # Root scripts
└── scripts/           # Magical setup scripts
```

## 🎨 Features

- **Hot Reload**: Frontend and backend changes auto-reload
- **TypeScript**: Full TypeScript support
- **Database ORM**: Prisma for type-safe database operations
- **Containerization**: Isolated development environments
- **Easy Setup**: One command to start everything
- **Graceful Shutdown**: Ctrl+C stops everything cleanly

## 🐛 Troubleshooting

### Docker Not Running
```bash
# Start Docker Desktop first, then run:
npm run dev
```

### Port Already in Use
```bash
# Stop existing services
npm run docker:down

# Or clean everything
npm run clean

# Then start again
npm run dev
```

### Database Issues
```bash
# Reset database
docker-compose exec backend npx prisma migrate reset --force

# Or restart everything
npm run dev
```

## 📚 Learning Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run dev`
5. Submit a pull request

---

**Happy coding! 🎉** 