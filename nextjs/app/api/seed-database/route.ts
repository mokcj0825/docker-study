import { NextRequest, NextResponse } from 'next/server';
import { getMongoCollection, closeMongoConnection } from '@/lib/mongodb';

interface DealerReport {
  code: string;
  totalProfit: number;
  totalCost: number;
}

interface ReportResponse {
  success: boolean;
  data: DealerReport[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

// Generate daily date ranges (60 days)
function getDailyDateRanges(): Array<{ startDate: string; endDate: string }> {
  const now = new Date();
  const dailyRanges: Array<{ startDate: string; endDate: string }> = [];
  
  // Generate past 60 days
  for (let i = 59; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    // For daily reports, startDate and endDate are the same day
    dailyRanges.push({
      startDate: dateStr,
      endDate: dateStr
    });
  }
  
  return dailyRanges;
}

// Generate weekly date ranges (60 weeks)
function getWeeklyDateRanges(): Array<{ startDate: string; endDate: string }> {
  const now = new Date();
  const weeklyRanges: Array<{ startDate: string; endDate: string }> = [];
  
  // Find the most recent Saturday (end of the most recent week)
  // getDay() returns: 0=Sunday, 1=Monday, ..., 6=Saturday
  const lastSaturday = new Date(now);
  const dayOfWeek = lastSaturday.getDay();
  // Calculate days to subtract to get to Saturday
  // If today is Sunday (0), we need to go back 1 day to get Saturday
  // If today is Saturday (6), we don't need to go back
  const daysToSaturday = dayOfWeek === 6 ? 0 : (dayOfWeek + 1);
  lastSaturday.setDate(lastSaturday.getDate() - daysToSaturday);
  lastSaturday.setHours(0, 0, 0, 0);
  
  // Generate past 60 weeks (each week is Sunday to Saturday)
  for (let i = 59; i >= 0; i--) {
    const weekEnd = new Date(lastSaturday);
    weekEnd.setDate(weekEnd.getDate() - (i * 7));
    
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6); // Sunday is 6 days before Saturday
    
    weeklyRanges.push({
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0]
    });
  }
  
  return weeklyRanges;
}

// Fetch all pages from API endpoint
async function fetchAllPagesFromAPI(
  reportType: 'daily' | 'weekly',
  startDate: string,
  endDate: string,
  baseUrl: string
): Promise<DealerReport[]> {
  const allData: DealerReport[] = [];
  let currentPage = 1;
  const pageSize = 100;
  
  const apiUrl = `${baseUrl}/api/backend/report/${reportType}`;
  
  while (true) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          page: currentPage,
          pageSize
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const result: ReportResponse = await response.json();
      
      if (!result.success || !result.data || result.data.length === 0) {
        break;
      }
      
      allData.push(...result.data);
      
      if (currentPage >= result.pagination.totalPages) {
        break;
      }
      
      currentPage++;
    } catch (error) {
      console.error(`Error fetching page ${currentPage} from ${apiUrl}:`, error);
      throw error;
    }
  }
  
  return allData;
}

// Store data in MongoDB
async function storeInMongoDB(
  reportType: 'daily' | 'weekly',
  startDate: string,
  endDate: string,
  data: DealerReport[]
) {
  const collection = await getMongoCollection('backend_reports');
  
  const id = `backend-${reportType}-${startDate}-${endDate}`;
  const document = {
    reportType,
    startDate,
    endDate,
    data,
    createdAt: new Date()
  };
  
  await collection.replaceOne(
    { reportType, startDate, endDate },
    { _id: id, ...document },
    { upsert: true }
  );
}

export async function GET(request: NextRequest) {
  try {
    const dailyRanges = getDailyDateRanges();
    const weeklyRanges = getWeeklyDateRanges();
    
    // Get base URL from request headers
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    // Store daily reports for each day (60 days)
    console.log('Fetching and storing daily reports for past 60 days...');
    let dailyCount = 0;
    for (const dateRange of dailyRanges) {
      const dailyData = await fetchAllPagesFromAPI('daily', dateRange.startDate, dateRange.endDate, baseUrl);
      await storeInMongoDB('daily', dateRange.startDate, dateRange.endDate, dailyData);
      dailyCount++;
      if (dailyCount % 10 === 0) {
        console.log(`Stored ${dailyCount} daily records...`);
      }
    }
    console.log(`Completed: Stored ${dailyCount} daily records`);
    
    // Store weekly reports for each week (60 weeks)
    console.log('Fetching and storing weekly reports for past 60 weeks...');
    let weeklyCount = 0;
    for (const dateRange of weeklyRanges) {
      const weeklyData = await fetchAllPagesFromAPI('weekly', dateRange.startDate, dateRange.endDate, baseUrl);
      await storeInMongoDB('weekly', dateRange.startDate, dateRange.endDate, weeklyData);
      weeklyCount++;
      if (weeklyCount % 10 === 0) {
        console.log(`Stored ${weeklyCount} weekly records...`);
      }
    }
    console.log(`Completed: Stored ${weeklyCount} weekly records`);
    
    // Close MongoDB connection after all operations
    await closeMongoConnection();
    
    return NextResponse.json(
      {
        success: true,
        message: 'Database seeded successfully',
        summary: {
          daily: {
            records: dailyCount,
            dateRange: `${dailyRanges[0].startDate} to ${dailyRanges[dailyRanges.length - 1].endDate}`
          },
          weekly: {
            records: weeklyCount,
            dateRange: `${weeklyRanges[0].startDate} to ${weeklyRanges[weeklyRanges.length - 1].endDate}`
          }
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Seed database error:', error);
    await closeMongoConnection();
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to seed database',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
