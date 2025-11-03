import { MongoClient, Db, Collection, Document } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin@localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'testdb';

let client: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Get or create MongoDB client
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client;
}

/**
 * Get or create MongoDB database instance
 */
export async function getMongoDb(): Promise<Db> {
  if (!cachedDb) {
    const client = await getMongoClient();
    cachedDb = client.db(DB_NAME);
  }
  return cachedDb;
}

/**
 * Get a specific collection from MongoDB
 */
export async function getMongoCollection<T extends Document = Document>(
  collectionName: string
): Promise<Collection<T>> {
  const db = await getMongoDb();
  return db.collection<T>(collectionName);
}

/**
 * Close MongoDB connection
 */
export async function closeMongoConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    cachedDb = null;
  }
}

/**
 * Execute a function with MongoDB connection and auto-close
 */
export async function withMongo<T>(
  fn: (client: MongoClient, db: Db) => Promise<T>
): Promise<T> {
  const client = await getMongoClient();
  const db = await getMongoDb();
  try {
    return await fn(client, db);
  } finally {
    await closeMongoConnection();
  }
}

