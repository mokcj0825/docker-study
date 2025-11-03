# Database Client Libraries

This directory contains reusable database client libraries for MongoDB and DynamoDB.

## MongoDB Client (`mongodb.ts`)

A MongoDB client wrapper with connection pooling and utility functions.

### Usage

```typescript
import { getMongoCollection, closeMongoConnection } from '@/lib/mongodb';

// Get a collection
const collection = await getMongoCollection('my_collection');

// Use the collection
await collection.insertOne({ name: 'John', age: 30 });

// Close connection when done
await closeMongoConnection();
```

### Available Functions

- `getMongoClient()`: Get or create MongoDB client
- `getMongoDb()`: Get or create database instance
- `getMongoCollection<T>(name)`: Get a specific collection
- `closeMongoConnection()`: Close the connection
- `withMongo<T>(fn)`: Execute function with auto-close connection

### Environment Variables

- `MONGODB_URI`: MongoDB connection string (default: `mongodb://admin:admin@localhost:27017`)
- `MONGODB_DB_NAME`: Database name (default: `testdb`)

## DynamoDB Client (`dynamodb.ts`)

A DynamoDB client wrapper for local development.

### Usage

```typescript
import { getDynamoDBClient, getDynamoDBTableName } from '@/lib/dynamodb';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = getDynamoDBClient();
const tableName = getDynamoDBTableName('MyTable');

// Put item
await client.send(new PutCommand({
  TableName: tableName,
  Item: { id: '123', name: 'John' }
}));
```

### Available Functions

- `getDynamoDBClient()`: Get or create DynamoDB document client
- `getDynamoDBTableName(name)`: Get table name with optional env override

### Environment Variables

- `DYNAMODB_ENDPOINT`: DynamoDB endpoint (default: `http://localhost:8000`)
- `DYNAMODB_TABLE_<TABLE_NAME>`: Override specific table names

## Notes

- Both clients use connection pooling and caching
- Clients are singleton instances
- Remember to close MongoDB connections when done
- DynamoDB client is stateless and doesn't need closing

