import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createExportRecord, generateCashFlowReportData, generateCategoryBreakdownData, generateMonthlyComparisonData } from '@/lib/report-export';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportType, fileFormat, dateRangeStart, dateRangeEnd, teamId } = await request.json();

    if (!reportType || !fileFormat) {
      return NextResponse.json(
        { error: 'Report type and file format are required' },
        { status: 400 }
      );
    }

    const startDate = new Date(dateRangeStart);
    const endDate = new Date(dateRangeEnd);

    const exportRecord = await createExportRecord(session.user.id, {
      reportType,
      fileFormat,
      dateRangeStart: startDate,
      dateRangeEnd: endDate,
      teamId,
    });

    let reportData: any;

    if (reportType === 'cash_flow') {
      reportData = await generateCashFlowReportData(session.user.id, startDate, endDate);
    } else if (reportType === 'category_breakdown') {
      reportData = await generateCategoryBreakdownData(session.user.id, startDate, endDate);
    } else if (reportType === 'monthly_comparison') {
      reportData = await generateMonthlyComparisonData(session.user.id, startDate, endDate);
    } else if (reportType === 'full_report') {
      const cf = await generateCashFlowReportData(session.user.id, startDate, endDate);
      const cb = await generateCategoryBreakdownData(session.user.id, startDate, endDate);
      const mc = await generateMonthlyComparisonData(session.user.id, startDate, endDate);
      reportData = { cf, cb, mc };
    }

    return NextResponse.json({
      exportId: exportRecord.id,
      reportData,
      status: 'ready_for_download',
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const exports = await prisma.reportExport.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json(exports);
  } catch (error) {
    console.error('Error fetching exports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exports' },
      { status: 500 }
    );
  }
}