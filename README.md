# Docker Study Project

A microservices-based application demonstrating Docker and container orchestration with database operations.

## Project Structure

```
docker-study/
├── frontend/          # React application (Vite + TypeScript)
├── backend/           # Node.js API service with Prisma ORM
└── docker-compose.yml # Container orchestration
```

## Prerequisites

- Docker Desktop
- VS Code with REST Client extension (for API testing)

## Getting Started

1. Start Docker Desktop
2. Clone the repository
3. Run the application:
   ```bash
   docker-compose up --build
   ```

## Complete Database & API Tutorial

### Step 1: Initial Setup

1. **Start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Create initial Product table:**
   ```bash
   docker-compose exec backend npx prisma migrate dev --name create_product_table
   ```

3. **Test initial API:**
   ```http
   ### Test Initial Product Creation
   POST http://localhost:3001/api/products
   Content-Type: application/json

   {
       "name": "Gaming Mouse",
       "price": 59.99,
       "stock": 100
   }
   ```

### Step 2: Add New Field to Database Schema

1. **Update Prisma schema** (`backend/prisma/schema.prisma`):
   ```prisma
   model Product {
     id        Int      @id @default(autoincrement())
     name      String
     price     Decimal
     stock     Int
     remark    String?  // Add this line
     createdAt DateTime @default(now())
   }
   ```

2. **Create and apply migration:**
   ```bash
   docker-compose exec backend npx prisma migrate dev --name add_remark_field
   ```

3. **Regenerate Prisma client:**
   ```bash
   docker-compose exec backend npx prisma generate
   ```

4. **Restart backend service:**
   ```bash
   docker-compose restart backend
   ```

5. **Test updated API:**
   ```http
   ### Test Product Creation with Remark
   POST http://localhost:3001/api/products
   Content-Type: application/json

   {
       "name": "Gaming Keyboard",
       "price": 129.99,
       "stock": 50,
       "remark": "RGB Backlit Mechanical"
   }
   ```

### Step 3: Verify Database Changes

1. **Get all products:**
   ```http
   ### Get All Products
   GET http://localhost:3001/api/products
   ```

2. **Use Prisma Studio (optional):**
   ```bash
   docker-compose exec backend npx prisma studio
   ```
   - Opens at http://localhost:5555
   - View table structure and data

### Step 4: Delete Table (Cleanup)

1. **Remove Product model from schema:**
   ```prisma
   // Delete or comment out the entire Product model
   // model Product { ... }
   ```

2. **Apply migration:**
   ```bash
   docker-compose exec backend npx prisma migrate dev --name remove_product_table
   ```

3. **Verify deletion:**
   ```http
   ### This should now fail as table doesn't exist
   GET http://localhost:3001/api/products
   ```

## Common Issues & Solutions

### Issue 1: Prisma Client Not Initialized
**Error:** `@prisma/client did not initialize yet`
**Solution:**
```bash
docker-compose exec backend npx prisma generate
docker-compose restart backend
```

### Issue 2: Unknown Field Error
**Error:** `Unknown argument 'remark'`
**Solution:**
1. Ensure migration was applied: `docker-compose exec backend npx prisma migrate dev`
2. Regenerate client: `docker-compose exec backend npx prisma generate`
3. Restart service: `docker-compose restart backend`

### Issue 3: Docker Connection Issues
**Error:** `docker daemon is not running`
**Solution:** Start Docker Desktop and wait for it to fully initialize

## API Testing with VS Code

1. Install REST Client extension
2. Open `backend/test/api.http`
3. Click "Send Request" above each request
4. View responses in the right panel

## Development Commands

```bash
# Start all services
docker-compose up

# Rebuild and start
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend

# Database operations
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma generate
docker-compose exec backend npx prisma studio

# Restart specific service
docker-compose restart backend
```

## Key Learning Points

1. **Docker Compose** manages multiple services together
2. **Prisma Migrations** handle database schema changes
3. **Volume Mounting** enables live code changes
4. **Service Dependencies** ensure proper startup order
5. **Environment Variables** configure services
6. **Health Checks** ensure services are ready

## Troubleshooting

- **Service won't start:** Check Docker Desktop is running
- **Database connection failed:** Wait for PostgreSQL to fully initialize
- **API not responding:** Check backend logs with `docker-compose logs backend`
- **Schema changes not reflected:** Regenerate Prisma client and restart service

## Next Steps

- Add more API endpoints (update, delete)
- Implement authentication
- Add frontend integration
- Set up CI/CD pipeline
- Add monitoring and logging

## License

MIT 