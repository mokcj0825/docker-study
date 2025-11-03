import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';

let cachedClient: DynamoDBDocumentClient | null = null;

/**
 * Get or create DynamoDB client
 */
export function getDynamoDBClient(): DynamoDBDocumentClient {
  if (!cachedClient) {
    const dynamoDBClient = new DynamoDBClient({
      region: 'local',
      endpoint: DYNAMODB_ENDPOINT,
      credentials: {
        accessKeyId: 'dummy',
        secretAccessKey: 'dummy'
      }
    });
    
    cachedClient = DynamoDBDocumentClient.from(dynamoDBClient, {
      marshallOptions: {
        convertEmptyValues: false,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      },
      unmarshallOptions: {
        wrapNumbers: false,
      },
    });
  }
  
  return cachedClient;
}

/**
 * Get DynamoDB table name with optional environment variable override
 */
export function getDynamoDBTableName(defaultName: string): string {
  const envVarName = `DYNAMODB_TABLE_${defaultName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
  return process.env[envVarName] || defaultName;
}

/**
 * Get raw DynamoDB client (not document client)
 */
function getRawDynamoDBClient(): DynamoDBClient {
  return new DynamoDBClient({
    region: 'local',
    endpoint: DYNAMODB_ENDPOINT,
    credentials: {
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy'
    }
  });
}

/**
 * Ensure table exists, create if it doesn't
 */
export async function ensureTableExists(tableName: string): Promise<void> {
  const client = getRawDynamoDBClient();
  
  try {
    // Check if table exists
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    // Table exists, nothing to do
    return;
  } catch (error: any) {
    // If error is ResourceNotFoundException, table doesn't exist
    if (error.name === 'ResourceNotFoundException') {
      try {
        // Create table
        await client.send(new CreateTableCommand({
          TableName: tableName,
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' }
          ],
          KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }
          ],
          BillingMode: 'PAY_PER_REQUEST'
        }));
      } catch (createError: any) {
        // If table already exists (race condition), ignore
        if (createError.name === 'ResourceInUseException') {
          return;
        }
        throw createError;
      }
    } else {
      throw error;
    }
  }
}

