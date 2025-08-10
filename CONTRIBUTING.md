# Contributing to Docker Study Project

Thank you for your interest in contributing to the Docker Study Project! This guide will help you get started.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork**
3. **Set up the development environment**
4. **Make your changes**
5. **Test your changes**
6. **Submit a pull request**

## Development Setup

### Prerequisites

- **Docker Desktop** (for Docker development)
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

### Getting Started

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/docker-study.git
cd docker-study

# Install dependencies
npm run install:all

# Start the development environment
npm run dev
```

## 🎯 Development Workflow

### 1. Choose Your Development Method

#### Option A: Docker Development (Recommended)
```bash
npm run dev
```
- Starts everything in containers
- Consistent environment
- Production-like setup

#### Option B: Local Development
```bash
npm run dev:local
```
- Runs services locally
- Faster startup
- Direct file access

### 2. Making Changes

#### Backend Changes
```bash
cd backend
# Make your changes to TypeScript files
# Changes auto-reload with ts-node-dev
```

#### Frontend Changes
```bash
cd frontend
# Make your changes to React components
# Changes auto-reload with Vite
```

#### Database Changes
```bash
cd backend
# Edit prisma/schema.prisma
# Then restart the development environment
npm run dev
```

### 3. Testing Your Changes

```bash
# Test the full stack
npm run dev

# Test individual services
npm run dev:backend
npm run dev:frontend

# Run tests (when available)
npm test
```

## 📁 Project Structure

```
docker-study/
├── frontend/              # React frontend
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── backend/              # Node.js backend
│   ├── src/              # Source code
│   ├── prisma/           # Database schema
│   └── package.json      # Backend dependencies
├── scripts/              # Development scripts
├── docker-compose.yml    # Docker orchestration
└── package.json          # Root scripts
```

## 🔧 Available Scripts

### Root Level
```bash
npm run dev              # Start everything with Docker
npm run dev:local        # Start everything locally
npm run dev:backend      # Start only backend
npm run dev:frontend     # Start only frontend
npm run docker:down      # Stop Docker services
npm run docker:logs      # View Docker logs
npm run clean            # Clean up everything
```

### Backend
```bash
cd backend
npm run dev              # Start with Docker
npm run dev:local        # Start locally
npm run build            # Build TypeScript
npm run start            # Start production build
```

### Frontend
```bash
cd frontend
npm run dev              # Start with Docker
npm run dev:local        # Start locally
npm run build            # Build for production
npm run preview          # Preview production build
```

## 🐛 Troubleshooting

### Common Issues

#### Docker Not Starting
```bash
# Check if Docker Desktop is running
docker --version

# Restart Docker Desktop if needed
```

#### Port Conflicts
```bash
# Check what's using the ports
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Stop conflicting services
npm run docker:down
```

#### Database Issues
```bash
# Reset database
docker-compose exec backend npx prisma migrate reset --force

# Or restart everything
npm run dev
```

#### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run install:all
```

## 📝 Code Style

### TypeScript
- Use TypeScript for all new code
- Follow strict type checking
- Use interfaces for object shapes
- Prefer `const` over `let`

### React
- Use functional components with hooks
- Use TypeScript for props
- Follow React best practices
- Use meaningful component names

### Database
- Use Prisma for database operations
- Write migrations for schema changes
- Use meaningful table and column names
- Add proper indexes

## 🧪 Testing

### Running Tests
```bash
# When tests are added
npm test
npm run test:watch
npm run test:coverage
```

### Writing Tests
- Write tests for new features
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

## 📤 Submitting Changes

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes
- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Test your changes thoroughly

### 3. Commit Your Changes
```bash
git add .
git commit -m "feat: add new feature description"
```

### 4. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

### 5. Pull Request Guidelines
- Use descriptive titles
- Include a summary of changes
- Reference any related issues
- Ensure all tests pass
- Update documentation if needed

## 📚 Documentation

### Updating Documentation
- Keep README.md up to date
- Document new features
- Update API documentation
- Add examples for new functionality

### Code Comments
- Comment complex logic
- Use JSDoc for functions
- Explain business logic
- Keep comments current

## 🤝 Code Review

### Review Process
1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** in development environment
4. **Documentation** updates if needed

### Review Guidelines
- Be constructive and respectful
- Focus on code quality and functionality
- Suggest improvements when possible
- Test the changes locally

## 🎉 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor hall of fame

## 📞 Getting Help

- **Issues**: Create an issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check the README and guides first

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing! 🎉** 