import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey } from '@/lib/api-key';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    const apiKeyRecord = await verifyApiKey(apiKey);
    if (!apiKeyRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired API key' },
        { status: 401 }
      );
    }

    const userId = apiKeyRecord.userId;
    const dataType = request.nextUrl.searchParams.get('type') || 'transactions';
    const days = parseInt(request.nextUrl.searchParams.get('days') || '30', 10);

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    if (dataType === 'transactions') {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: dateFrom },
        },
        select: {
          id: true,
          type: true,
          amount: true,
          category: true,
          date: true,
          description: true,
        },
        orderBy: { date: 'desc' },
      });
      return NextResponse.json({ transactions });
    } else if (dataType === 'forecasts') {
      const forecasts = await prisma.forecast.findMany({
        where: {
          userId,
          date: { gte: dateFrom },
        },
        select: {
          id: true,
          date: true,
          projectedCashFlow: true,
          confidence: true,
          isAnomaly: true,
        },
        orderBy: { date: 'asc' },
      });
      return NextResponse.json({ forecasts });
    } else if (dataType === 'summary') {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: dateFrom },
        },
      });

      const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      const expenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      return NextResponse.json({
        summary: {
          totalTransactions: transactions.length,
          totalIncome: income,
          totalExpenses: expenses,
          netCashFlow: income - expenses,
          period: `${days} days`,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid data type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching public data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}