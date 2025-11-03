import { NextRequest, NextResponse } from 'next/server';
import { getMongoCollection, closeMongoConnection } from '@/lib/mongodb';

const COLLECTION_NAME = 'random_data';

// Generate random data
function generateRandomData() {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah'];
  const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Toronto', 'Berlin', 'Dubai'];
  
  const data = [];
  for (let i = 0; i < 10; i++) {
    data.push({
      name: names[Math.floor(Math.random() * names.length)],
      age: Math.floor(Math.random() * 50) + 20,
      city: cities[Math.floor(Math.random() * cities.length)],
      timestamp: new Date(),
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
    // Get collection
    const collection = await getMongoCollection(COLLECTION_NAME);
    
    // Generate random data
    const randomData = generateRandomData();
    
    // Insert data
    const result = await collection.insertMany(randomData);
    
    // Close connection
    await closeMongoConnection();
    
    return NextResponse.json({
      success: true,
      message: `Successfully inserted ${result.insertedCount} documents into MongoDB`,
      count: result.insertedCount,
      sample: randomData[0]
    });
    
  } catch (error) {
    console.error('MongoDB error:', error);
    await closeMongoConnection();
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to insert data into MongoDB',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get collection
    const collection = await getMongoCollection(COLLECTION_NAME);
    
    // Count documents
    const count = await collection.countDocuments();
    
    // Get a few sample documents
    const samples = await collection.find({}).limit(5).toArray();
    
    // Close connection
    await closeMongoConnection();
    
    return NextResponse.json({
      success: true,
      totalDocuments: count,
      samples: samples
    });
    
  } catch (error) {
    console.error('MongoDB error:', error);
    await closeMongoConnection();
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch data from MongoDB',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
