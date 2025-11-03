# Docker Study Project

A Next.js development environment with Docker containerization.

## 🚀 Quick Start

**Just run Docker:**

```bash
docker-compose up --build
```

Or use the npm scripts:

```bash
# Build and start containers
npm run docker:up

# Or start Next.js locally for development
npm run dev:nextjs
```

## 🎯 What You Get

After running `docker-compose up --build`, you'll have:

- **Next.js App**: http://localhost:3000 (Next.js + TypeScript + Tailwind CSS)
- **DynamoDB Local**: http://localhost:8000 (AWS DynamoDB local instance)
- **MongoDB Local**: mongodb://localhost:27017 (MongoDB with admin/admin credentials)
- **Production-ready Docker image** with multi-stage builds

## 🔧 Available Commands

### From Project Root

```bash
# Start Next.js locally for development
npm run dev:nextjs

# Install dependencies
npm run install:all

# Build and start Docker containers
npm run docker:up

# Stop Docker containers
npm run docker:down

# View Docker logs
npm run docker:logs

# Clean up everything
npm run clean
```

### From Next.js Directory

```bash
cd nextjs

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## 📁 Project Structure

```
docker-study/
├── nextjs/            # Next.js + TypeScript + Tailwind CSS
│   ├── app/          # App Router pages
│   ├── public/       # Static assets
│   ├── Dockerfile    # Multi-stage production Dockerfile
│   └── package.json  # Next.js dependencies
├── docker-compose.yml # Docker orchestration
└── package.json      # Root scripts
```

## 🎨 Features

- **Next.js 16**: Latest version with App Router
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Docker**: Multi-stage builds for optimized images
- **Production-ready**: Standalone output for minimal container size
- **Security**: Non-root user in container
- **Hot Reload**: Fast development experience

## 🐳 Docker Services

### Next.js
The project uses a multi-stage Docker build:

1. **Base stage**: Node.js Alpine image
2. **Dependencies stage**: Install npm packages
3. **Builder stage**: Compile TypeScript and build Next.js
4. **Runner stage**: Production-optimized image with only necessary files

### DynamoDB Local
- Official AWS DynamoDB Local image
- In-memory database for development
- No authentication required
- Access via AWS SDK or DynamoDB CLI

### MongoDB Local
- Latest MongoDB community edition
- Persistent data storage with Docker volumes
- Default credentials: admin/admin
- Access via MongoDB drivers or Compass

## 🐛 Troubleshooting

### Docker Not Running

```bash
# Start Docker Desktop first, then run:
docker-compose up --build
```

### Port Already in Use

```bash
# Stop existing containers
npm run docker:down

# Or clean everything
npm run clean

# Then start again
npm run docker:up
```

### Container Issues

```bash
# View logs
docker-compose logs -f

# Rebuild from scratch
docker-compose down
docker-compose up --build
```

## 📚 Learning Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js on Docker](https://github.com/vercel/next.js/tree/canary/examples/with-docker)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run docker:up`
5. Submit a pull request

---

**Happy coding! 🎉**
