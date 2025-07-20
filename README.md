# Docker Study Project

A microservices-based application demonstrating Docker and container orchestration.

## Project Structure

```
docker-study/
├── frontend/          # React application (Vite + TypeScript)
├── backend/           # Node.js API service
└── database/          # PostgreSQL database
```

## Prerequisites

- Docker
- Docker Compose
- Node.js (for local development)

## Getting Started

1. Clone the repository
2. Run the application:
   ```bash
   docker-compose up
   ```
3. Access the services:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Database: localhost:5432

## Development

Each service can be developed independently:

- Frontend: React application with Vite
- Backend: Node.js/Express API
- Database: PostgreSQL

## Docker Commands

Common commands:

```bash
# Start all services
docker-compose up

# Rebuild and start services
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build <service-name>
```

## License

MIT 