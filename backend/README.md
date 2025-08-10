# Backend API - Database Guide

## Quick Reference: Essential Steps

### Getting Started

1. **Start all services:**
   ```bash
   docker-compose up --build
   ```
   This will read docker-compose.yml under your directory. You have to prepare it before start. About the docker-compose.yml, please refer to [docker-compose.md](./docker-compose.md)

2. **Sync database with Prisma schema:**
   
   **For new projects (first-time setup):**
   ```bash
   docker-compose exec backend npx prisma db push
   ```
   
   **For existing projects (with migrations):**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```
   
   This will read the schema.prisma file and sync it with the database. For new projects, `db push` directly applies schema changes. For existing projects with migration history, `migrate deploy` applies all migrations in order. For database modification and migration, please refer to [migration.md](./migration.md)

3. **Verify database is connected or not (Optional)**
   ```bash
   docker-compose exec backend npx prisma db pull --print
   ```
   This command checks if Prisma can connect to your database and print the current database schema. Well, that's all.


4. **Update Prisma client model**
   ```bash
   docker-compose exec backend npx prisma generate
   ```

5. **Update the Prisma client definition**
   ```bash
   cd backend
   npx prisma generate
   ```
   Step 4 and Step 5 are similar, the only difference is where the `npx prisma generate` executed. In Step 4, we execute it in `backend` container, while Step 5, we change our directory to backend, then execute the prisma generate, to update the `node_modules`. 

6. **Verify the updated Prisma client is available in your Docker container (Optional)**
   ```bash
   docker-compose exec backend grep -A 10 "export const ModelName" node_modules/.prisma/client/index.d.ts
   ``` 
   This command inspects the generated Prisma Client in your `backend` container to ensure the schema is updated. You can replace `export const ModelName` with any identifier that reflects your recent changes in the schema.

7. **Ensure your TypeScript service uses the updated Prisma Client**
   ```typescript
   const prisma = new PrismaClient();

   export const SomewhatYourController {
      const tableDelegate = prisma.yourTableName
   }
   ```
   After running `npx prisma generate`, the PrismaClient will be regenerated based on your updated schema. You’ll see the new model fields or tables reflected in TypeScript autocomplete and type checks.

8. **That's all**


## Modification in Database?

Repeat Step 2 to Step 7 after you updated your database schema.

### Get rid of docker-compose, I just want npm everything
[Here](no-docker.md)