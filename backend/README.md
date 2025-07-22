# Backend API - Database Guide

## Quick Reference: Essential Steps

### Getting Started

1. **Start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Sync database with Prisma schema:**
   ```bash
   docker-compose exec backend npx prisma db push
   ```

3. **Verify database is connected or not (Optional)**
   ```bash
   docker-compose exec backend npx prisma db pull --print
   ```

4. **Update Prisma client model**
   ```bash
   docker-compose exec backend npx prisma generate
   ```

5. **Update the Prisma client definition**
   ```bash
   cd backend
   npx prisma generate
   ```

6. **Verify the updated Prisma client is available in your Docker container**
   ```bash
   docker-compose exec backend grep -A 10 "export const ModelName" node_modules/.prisma/client/index.d.ts
   ``` 

7. **Ensure your TypeScript service updates the new Prisma schema**
   ```typescript
   const prisma = new PrismaClient();

   export const SomewhatYourController {
      const tableDelegate = prisma.yourTableName
   }
   ```

8. **That's all, Gracias**


## Modification in Database?

Repeat Step 2 to Step 7 after you updated your database schema.