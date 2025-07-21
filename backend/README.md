# Backend API - Database Operations Guide

## Quick Reference: Essential Steps

### 1. When You Add a New Database Table

**Step 1: Update Prisma Schema**
```prisma
// Add to backend/prisma/schema.prisma
model YourTable {
  id        Int      @id @default(autoincrement())
  name      String
  // Add your fields here
  createdAt DateTime @default(now())
}
```

**Step 2: Create and Apply Migration**
```bash
docker-compose exec backend npx prisma migrate dev --name create_your_table
```

**Step 3: Regenerate Prisma Client**
```bash
docker-compose exec backend npx prisma generate
```

**Step 4: Restart Backend Service**
```bash
docker-compose restart backend
```

### 2. When You Edit an Existing Database Table

**Step 1: Update Prisma Schema**
```prisma
// Modify in backend/prisma/schema.prisma
model YourTable {
  id        Int      @id @default(autoincrement())
  name      String
  newField  String?  // Add new field
  // Modify existing fields
  createdAt DateTime @default(now())
}
```

**Step 2: Create and Apply Migration**
```bash
docker-compose exec backend npx prisma migrate dev --name add_new_field
```

**Step 3: Regenerate Prisma Client**
```bash
docker-compose exec backend npx prisma generate
```

**Step 4: Restart Backend Service**
```bash
docker-compose restart backend
```

### 3. When You Add a New API Endpoint

**Step 1: Create Controller** (`backend/src/controllers/your.controller.ts`)
```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const yourController = {
  async create(req: Request, res: Response) {
    try {
      const { name, field1, field2 } = req.body;
      const item = await prisma.yourTable.create({
        data: { name, field1, field2 }
      });
      res.status(201).json(item);
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).json({ 
        error: 'Failed to create item',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const items = await prisma.yourTable.findMany();
      res.json(items);
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ 
        error: 'Failed to fetch items',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
```

**Step 2: Add Routes** (`backend/src/index.ts`)
```typescript
import { yourController } from './controllers/your.controller';

// Add these lines
app.post('/api/your-items', yourController.create);
app.get('/api/your-items', yourController.getAll);
```

**Step 3: Create Test File** (`backend/test/your-api.http`)
```http
### Create New Item
POST http://localhost:3001/api/your-items
Content-Type: application/json

{
    "name": "Test Item",
    "field1": "value1",
    "field2": "value2"
}

### Get All Items
GET http://localhost:3001/api/your-items
```

**Step 4: Test Your API**
- Open `backend/test/your-api.http` in VS Code
- Click "Send Request" above each request
- Verify responses

### 4. When You Delete a Database Table

**Step 1: Remove from Prisma Schema**
```prisma
// Comment out or delete the model in backend/prisma/schema.prisma
// model YourTable {
//   id        Int      @id @default(autoincrement())
//   name      String
//   createdAt DateTime @default(now())
// }
```

**Step 2: Create and Apply Migration**
```bash
docker-compose exec backend npx prisma migrate dev --name remove_your_table
```

**Step 3: Regenerate Prisma Client**
```bash
docker-compose exec backend npx prisma generate
```

**Step 4: Restart Backend Service**
```bash
docker-compose restart backend
```

## Common Commands

```bash
# Start all services
docker-compose up --build

# View backend logs
docker-compose logs -f backend

# Database operations
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma generate
docker-compose exec backend npx prisma studio

# Restart backend
docker-compose restart backend

# Stop all services
docker-compose down
```

## Troubleshooting

### Issue: "Unknown argument" error
**Solution:**
```bash
docker-compose exec backend npx prisma generate
docker-compose restart backend
```

### Issue: "Cannot read properties of undefined" error
**Solution:**
```bash
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma generate
docker-compose restart backend
```

### Issue: API not responding
**Solution:**
```bash
docker-compose logs backend
docker-compose restart backend
```

## Best Practices

1. **Always regenerate Prisma client** after schema changes
2. **Always restart backend** after Prisma operations
3. **Test APIs immediately** after changes
4. **Use meaningful migration names** (e.g., `add_user_email_field`)
5. **Keep test files updated** with your API changes
6. **Check logs** when things go wrong

## File Structure

```
backend/
├── src/
│   ├── controllers/     # API logic
│   └── index.ts        # Main server file
├── prisma/
│   └── schema.prisma   # Database schema
├── test/
│   └── api.http        # API tests
└── package.json
```
