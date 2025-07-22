# Development Guide - Docker Study Project

## 🎯 Overview

This project demonstrates a complete full-stack development environment using Docker containerization. It includes a React frontend, Node.js backend, and PostgreSQL database, all orchestrated with Docker Compose.

## 🚀 The Magical Experience

### One Command to Rule Them All

```bash
npm run dev
```

This single command automatically:
- ✅ Checks Docker status
- ✅ Installs dependencies
- ✅ Starts all services
- ✅ Sets up database schema
- ✅ Generates Prisma client
- ✅ Waits for services to be ready
- ✅ Shows helpful information
- ✅ Streams live logs

### What You Get

After running the magical command:

- **Frontend**: http://localhost:5173 (React + TypeScript + Vite)
- **Backend API**: http://localhost:3001 (Node.js + Express + TypeScript)
- **Database**: localhost:5432 (PostgreSQL with Prisma ORM)

## 🏗️ Architecture

### Technology Stack

```
Frontend:
├── React 19
├── TypeScript
├── Vite (build tool)
├── Mantine UI (component library)
├── React Query (data fetching)
└── Zustand (state management)

Backend:
├── Node.js
├── Express.js
├── TypeScript
├── Prisma ORM
└── PostgreSQL

Infrastructure:
├── Docker
├── Docker Compose
└── Development scripts
```

### Project Structure

```
docker-study/
├── frontend/              # React application
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   ├── scripts/          # Development scripts
│   └── package.json      # Dependencies
├── backend/              # Node.js API
│   ├── src/              # Source code
│   ├── prisma/           # Database schema
│   ├── scripts/          # Development scripts
│   └── package.json      # Dependencies
├── scripts/              # Root development scripts
├── docker-compose.yml    # Service orchestration
├── package.json          # Root scripts
└── README.md             # Project documentation
```

## 🔧 Development Workflows

### Option 1: Docker Development (Recommended)

```bash
# Start everything with Docker
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend
```

**Benefits:**
- ✅ Consistent environment across team
- ✅ Production-like setup
- ✅ Isolated services
- ✅ Easy service communication

### Option 2: Local Development

```bash
# Start everything locally
npm run dev:local

# Start backend locally
cd backend && npm run dev:local

# Start frontend locally
cd frontend && npm run dev:local
```

**Benefits:**
- ✅ Faster startup times
- ✅ Direct file system access
- ✅ Easier debugging
- ✅ No Docker overhead

## 📊 Service Communication

### Network Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Port 5173)   │◄──►│   (Port 3001)   │◄──►│   (Port 5432)   │
│                 │    │                 │    │                 │
│ React + Vite    │    │ Node.js +       │    │ PostgreSQL      │
│                 │    │ Express         │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### API Endpoints

```typescript
// Backend API routes
GET    /api/products     // Get all products
POST   /api/products     // Create new product
GET    /api/products/:id // Get product by ID
PUT    /api/products/:id // Update product
DELETE /api/products/:id // Delete product
```

## 🗄️ Database Management

### Prisma Schema

```prisma
// prisma/schema.prisma
model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  price       Decimal
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Database Operations

```bash
# View database in browser
docker-compose exec backend npx prisma studio

# Reset database
docker-compose exec backend npx prisma migrate reset --force

# Create new migration
docker-compose exec backend npx prisma migrate dev --name add_new_field

# Push schema changes
docker-compose exec backend npx prisma db push
```

## 🔄 Hot Reload & Development

### Frontend Hot Reload
- **Vite** provides instant hot module replacement
- **TypeScript** compilation on save
- **CSS** changes reflect immediately
- **React** components update without page refresh

### Backend Hot Reload
- **ts-node-dev** watches for file changes
- **TypeScript** compilation on save
- **Express** server restarts automatically
- **Prisma** client regenerates when needed

## 🐛 Troubleshooting

### Common Issues

#### Docker Not Running
```bash
# Error: Docker daemon not running
# Solution: Start Docker Desktop
```

#### Port Conflicts
```bash
# Error: Port already in use
# Solution: Stop conflicting services
npm run docker:down
```

#### Database Connection Issues
```bash
# Error: Cannot connect to database
# Solution: Restart services
npm run dev
```

#### Dependencies Issues
```bash
# Error: Module not found
# Solution: Reinstall dependencies
npm run install:all
```

### Debug Commands

```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs -f [service_name]

# Access service shell
docker-compose exec [service_name] sh

# Check resource usage
docker stats
```

## 📈 Performance Optimization

### Development Performance
- **Volume mounts** for fast file access
- **Hot reload** for instant feedback
- **Shared node_modules** to reduce disk usage
- **Optimized Docker images** for faster builds

### Production Considerations
- **Multi-stage builds** for smaller images
- **Environment variables** for configuration
- **Health checks** for service monitoring
- **Resource limits** for container management

## 🧪 Testing Strategy

### Current Testing Setup
- **Manual testing** through API endpoints
- **Database testing** with Prisma Studio
- **Frontend testing** through browser

### Future Testing Plans
- **Unit tests** for backend functions
- **Integration tests** for API endpoints
- **E2E tests** for user workflows
- **Database tests** for data integrity

## 🚀 Deployment

### Development Deployment
```bash
# Build and start services
npm run dev

# Access services
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build

# Use production environment variables
# Configure reverse proxy (nginx)
# Set up SSL certificates
```

## 📚 Learning Resources

### Docker
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### Development
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)

### Tools
- [Vite Documentation](https://vitejs.dev/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

## 🎯 Best Practices

### Code Organization
- **Separation of concerns** between frontend and backend
- **Type safety** with TypeScript
- **Consistent naming** conventions
- **Modular architecture** for scalability

### Development Workflow
- **Version control** with Git
- **Branch-based development** for features
- **Code review** process for quality
- **Automated testing** for reliability

### Docker Practices
- **Multi-stage builds** for optimization
- **Environment-specific** configurations
- **Resource management** for containers
- **Security scanning** for vulnerabilities

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) for details.

---

**Happy coding! 🎉** 