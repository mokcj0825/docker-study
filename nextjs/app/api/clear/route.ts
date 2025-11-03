import { NextRequest, NextResponse } from 'next/server';
import { getMongoCollection, closeMongoConnection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Get the collection
    const collection = await getMongoCollection('backend_reports');
    
    // Delete all documents
    const result = await collection.deleteMany({});
    
    // Close connection
    await closeMongoConnection();
    
    return NextResponse.json(
      {
        success: true,
        message: 'All MongoDB records cleared',
        deletedCount: result.deletedCount
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Clear error:', error);
    await closeMongoConnection();
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to clear MongoDB records',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

