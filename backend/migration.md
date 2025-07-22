# Database migration
We are using prisma. So, we will start for the file `schema.prisma`. Assume you have knowledge on SQL Database.

## generator
```prisma
generator client {
    provider="prisma-client-js"
}
```
We are using default generator for Prisma. How to explain the generator... Alright, usually, we defined the database models, we will do like this: 
```sql
CREATE TABLE table_name (
id SERIAL PRIMARY KEY,
column1 VARCHAR(255) UNIQUE NOT NULL,
column2 VARCHAR(255), 
column3 number
);
```
Then, for type safety, we need to declare another Data object: 
```typescript
const table_name {
    id: number;
    column1: string;
    column2: string;
    column3: number;
}
```
To mitigate risks of SQL Injection, we need to manual sanitization on user input. 
For example: 
```typescript
const input = "' OR true --";
const input2 = "certain_value";
const query = `SELECT * FROM table_name WHERE column1 = '${input} AND column2 = '${input2};
console.log(query) // SELECT * FROM table_name WHERE column1 = '' OR true -- AND column2 = 'certain_value'
```
We have to process the input our own. In ORM, it will:
```typescript
const input = "' OR true --";
const input2 = "certain_value";
const query = table_name.model.getQuery(input, input2);
// SELECT * FROM table_name WHERE column1 = $1 AND column2 = $2, $1 = "' OR true --" (Stringified), $2 = "certain_value"
```
That's why we use ORM in project. However, ORM should be generic tools, but our database schema is specific. So we need something generators, based on provided schema, generate corresponding data object, including necessary database-related utilities. 

Back to schema.prisma, section generator is "What converter we use for database, in this project", datasource is where is the database, what is the type of it. For example: 
```prisma
generator client {
    provider = "prisma-client-js"
}

datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL");
}

model TABLE_NAME {
    a   Int     @id @default(autoincrement())
    b   String  
    c   String?
}
```

Once prisma generate, we will found updates in `node_modules/@prisma/client`. Prisma will generate the utilities in `node_modules`, this utility is ready to communicate with containers.

## What Prisma Generate Creates

After running `npx prisma generate`, Prisma creates:

### 1. **TypeScript Types**
```typescript
// Generated in node_modules/.prisma/client/index.d.ts
export type TABLE_NAME = {
  a: number
  b: string
  c: string | null
}
```

### 2. **Database Client**
```typescript
// Generated in node_modules/.prisma/client/index.js
export class PrismaClient {
  tABLE_NAME: TABLE_NAMEDelegate
  // ... other methods
}
```

### 3. **Query Methods**
```typescript
// You can now use these in your code:
const prisma = new PrismaClient()

// Find all records
const allRecords = await prisma.tABLE_NAME.findMany()

// Find by ID
const record = await prisma.tABLE_NAME.findUnique({
  where: { a: 1 }
})

// Create new record
const newRecord = await prisma.tABLE_NAME.create({
  data: {
    b: "some value",
    c: "optional value"
  }
})
```

## How It Communicates with Containers

The generated client uses the `DATABASE_URL` from your environment to connect to the database container:

```bash
# This URL connects to your PostgreSQL container
DATABASE_URL="postgresql://postgres:postgres@database:5432/docker_study"
```

- `postgres:postgres` = username:password
- `database` = container name (from docker-compose)
- `5432` = PostgreSQL port
- `docker_study` = database name

## What are Migrations?

### The Problem Without Migrations

Imagine you're developing an application and need to change your database structure:

**Initial Schema:**
```prisma
model User {
    id    Int     @id @default(autoincrement())
    email String  @unique
    name  String
}
```

**Later, you want to add a phone number:**
```prisma
model User {
    id    Int     @id @default(autoincrement())
    email String  @unique
    name  String
    phone String?  // New field
}
```

**Without migrations, you would:**
1. Manually write SQL: `ALTER TABLE "User" ADD COLUMN "phone" TEXT;`
2. Hope you remember to run it on production
3. Hope your team members run the same SQL
4. Risk forgetting or making mistakes

### Why Migration Important

**Migrations are version-controlled database changes** that:

1. **Track Every Change**: Every schema modification is recorded
2. **Team Safety**: Everyone gets the same database structure
3. **Production Safety**: Changes are applied consistently
4. **Rollback Capability**: You can undo changes if needed
5. **History**: You know exactly what changed and when

### How Migrations Work

**When you change your schema and run migration:**
```bash
npx prisma migrate dev --name add_user_phone
```

**Prisma creates a migration file:**
```sql
-- Migration: 20250721123456_add_user_phone
-- AlterTable
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
```

Then, push the migration to Git, so that all team members aware the changes in database.

### Migration vs Direct Push

| Feature | `prisma db push` | `prisma migrate` |
|---------|------------------|------------------|
| **Use Case** | Development, testing | Production, team development |
| **Version Control** | No migration files | Creates migration files |
| **Safety** | Can lose data | Safe, tracked changes |
| **Team Work** | Conflicts possible | Sequential, safe |
| **History** | No record of changes | Complete change history |

### Why Use Migrations?

**For Development:**
- Track your schema evolution
- Share changes with team members
- Test changes safely

**For Production:**
- Deploy database changes safely
- Rollback if something goes wrong
- Know exactly what's in production

**For Teams:**
- Everyone has the same database structure
- No "it works on my machine" issues
- Clear history of all changes

## Special Scenario: Team Collaboration

### Scenario 1

**Timeline:**
- **13:00**: Developer A adds `table_name.new_column` in database, then commits to VCS
- **14:00**: Developer B adds `table_name.another_column` in database, then commits to VCS  
- **15:00**: Maintainer merges Developer A's merge request/pull request
- **16:00**: Maintainer merges Developer B's merge request/pull request
- **17:00**: Frontend developer C pull the latest code

**What happens during migrations:**
1. **Frontend Developer C runs** `npx prisma migrate deploy`
2. **Prisma reads migration files** from `prisma/migrations/`
3. **Applies Developer A's migration** (adds new_column)
4. **Applies Developer B's migration** (adds another_column)
5. **Regenerates Prisma client** with new types
6. **Frontend gets updated TypeScript types** automatically

**Result:** ✅ **Frontend works perfectly** - all new columns available


### Scenario 2

**Timeline:**
- **13:00**: Developer A changes `table_name.column1` from `VARCHAR(50)` to `VARCHAR(100)`
- **14:00**: Developer B changes `table_name.column1` from `VARCHAR(50)` to `VARCHAR(200)`
- **15:00**: Maintainer merges Developer A's change
- **16:00**: Maintainer request Developer B resolves conflicts before merges Developer B's change, but the migration file is not removed
- **17:00**: Frontend developer C pull the latest code

**What happens during migrations:**
1. **Frontend Developer C runs** `npx prisma migrate deploy`
2. **Prisma reads migration files** from `prisma/migrations/`
3. **Applies Developer A's migration** (changes column1 to VARCHAR(100))
4. **Tries to apply Developer B's migration** (changes column1 to VARCHAR(200))
5. **❌ MIGRATION FAILS** - column already modified
6. **Prisma stops** and shows error message
7. **Database stays** in previous state
8. **Frontend gets no updates** - types remain old

**Result:** ❌ **Migration fails** - conflicting migrations detected

### Scenario 3

**Timeline:**
- **13:00**: Developer B changes `table_name.column1` from `VARCHAR(50)` to `VARCHAR(100)`
- **14:00**: Developer A changes `table_name.column1` from `VARCHAR(50)` to `VARCHAR(200)`
- **14:15**: Developer A created merge request/pull request
- **14:30**: Developer B created merge request/pull request
- **15:00**: Maintainer merges Developer A's change
- **16:00**: Maintainer request Developer B resolves conflicts before merges Developer B's change, but the migration file is not removed
- **17:00**: Frontend developer C pull the latest code

**What happens during migrations:**
1. **Frontend Developer C runs** `npx prisma migrate deploy`
2. **Prisma reads migration files** from `prisma/migrations/`
3. **Applies Developer A's migration** (changes column1 to VARCHAR(200)) - **FIRST**
4. **Tries to apply Developer B's migration** (changes column1 to VARCHAR(100)) - **SECOND**
5. **❌ MIGRATION FAILS** - column already modified by Developer A
6. **Prisma stops** and shows error message
7. **Database stays** with Developer A's change (VARCHAR(200))
8. **Frontend gets Developer A's types** but not Developer B's

**Result:** ❌ **Migration fails** - Developer B's migration conflicts with Developer A's already-applied change

