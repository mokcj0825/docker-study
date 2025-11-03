import { NextRequest, NextResponse } from 'next/server';
import { getMongoCollection, closeMongoConnection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Get the collection
    const collection = await getMongoCollection('backend_reports');
    
    // Get all documents from MongoDB
    const allDocuments = await collection.find({}).toArray();
    
    // Close connection
    await closeMongoConnection();
    
    // Return all records
    return NextResponse.json(
      {
        success: true,
        totalRecords: allDocuments.length,
        records: allDocuments.map(doc => ({
          id: doc._id,
          reportType: doc.reportType,
          startDate: doc.startDate,
          endDate: doc.endDate,
          dataCount: doc.data ? doc.data.length : 0,
          data: doc.data,
          createdAt: doc.createdAt
        }))
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Visualize error:', error);
    await closeMongoConnection();
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch records from MongoDB',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

