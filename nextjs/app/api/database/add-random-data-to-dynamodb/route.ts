import { NextRequest, NextResponse } from 'next/server';
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getDynamoDBClient, getDynamoDBTableName, ensureTableExists } from '@/lib/dynamodb';

const TABLE_NAME = getDynamoDBTableName('RandomDataTable');

// Generate random data
function generateRandomData() {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah'];
  const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Toronto', 'Berlin', 'Dubai'];
  
  const data = [];
  for (let i = 0; i < 10; i++) {
    data.push({
      id: `ID-${Date.now()}-${i}`,
      name: names[Math.floor(Math.random() * names.length)],
      age: Math.floor(Math.random() * 50) + 20,
      city: cities[Math.floor(Math.random() * cities.length)],
      timestamp: new Date().toISOString(),
      score: Math.floor(Math.random() * 1000) + 1,
      metadata: {
        active: Math.random() > 0.5,
        tags: ['tag' + Math.floor(Math.random() * 5)]
      }
    });
  }
  return data;
}

export async function POST(request: NextRequest) {
  try {
    // Ensure table exists
    await ensureTableExists(TABLE_NAME);
    
    // Get DynamoDB client
    const docClient = getDynamoDBClient();
    
    // Generate random data
    const randomData = generateRandomData();
    
    // Insert data items
    const results = await Promise.all(
      randomData.map(item =>
        docClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: item
          })
        )
      )
    );
    
    return NextResponse.json({
      success: true,
      message: `Successfully inserted ${randomData.length} items into DynamoDB`,
      count: randomData.length,
      sample: randomData[0]
    });
    
  } catch (error) {
    console.error('DynamoDB error:', error);
    
    // Check if error is due to missing table
    if (error instanceof Error && error.message.includes('cannot be found')) {
      return NextResponse.json(
        {
          success: false,
          message: 'DynamoDB table not found',
          error: 'Please create the table first. Use AWS CLI or the table creation API.',
          hint: `Run: aws dynamodb create-table --table-name ${TABLE_NAME} --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000`
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to insert data into DynamoDB',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Ensure table exists
    await ensureTableExists(TABLE_NAME);
    
    // Get DynamoDB client
    const docClient = getDynamoDBClient();
    
    // Scan table
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        Limit: 10
      })
    );
    
    return NextResponse.json({
      success: true,
      totalItems: result.Count || 0,
      scannedCount: result.ScannedCount || 0,
      items: result.Items || []
    });
    
  } catch (error) {
    console.error('DynamoDB error:', error);
    
    // Check if error is due to missing table
    if (error instanceof Error && error.message.includes('cannot be found')) {
      return NextResponse.json(
        {
          success: false,
          message: 'DynamoDB table not found',
          error: 'Please create the table first.',
          hint: `Table name: ${TABLE_NAME}`
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch data from DynamoDB',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
