import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import DEALER_LIST from '@/app/api/_const/dealer-list';
import { randomInt, randomFloat } from '@/app/api/_utils/random';

// Zod schema for request validation
const ReportRequestSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  pageSize: z.number().int().min(1).max(100).default(10),
  page: z.number().int().min(1).default(1)
});

type ReportRequest = z.infer<typeof ReportRequestSchema>;

// Response type
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

export async function GET(request: NextRequest) {
  return NextResponse.json({ success: true }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData: ReportRequest = ReportRequestSchema.parse(body);

    const { startDate, endDate, pageSize, page } = validatedData;

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return NextResponse.json(
        {
          success: false,
          message: 'Start date must be before or equal to end date'
        },
        { status: 400 }
      );
    }

    // Generate random report data for each dealer
    const allReports: DealerReport[] = DEALER_LIST.map(dealer => ({
      code: dealer.code,
      totalProfit: randomFloat(10000, 500000),
      totalCost: randomFloat(5000, 300000)
    }));

    // Calculate pagination
    const totalRecords = allReports.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRecords);
    
    // Get paginated results
    const paginatedReports = allReports.slice(startIndex, endIndex);

    // Return response
    const response: ReportResponse = {
      success: true,
      data: paginatedReports,
      pagination: {
        currentPage: page,
        pageSize,
        totalRecords,
        totalPages
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: error.issues.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error('Report generation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate report',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

