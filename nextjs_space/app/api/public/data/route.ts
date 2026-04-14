import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey } from '@/lib/api-key';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'API key is required',
          message: 'Include X-API-Key header with your request',
          status: 401,
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const apiKeyRecord = await verifyApiKey(apiKey);
    if (!apiKeyRecord) {
      return NextResponse.json(
        {
          error: 'Invalid or expired API key',
          message: 'The provided API key is not valid',
          status: 401,
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: apiKeyRecord.userId },
      select: { subscriptionTier: true },
    });

    const rateLimit = await checkRateLimit(
      apiKeyRecord.id,
      apiKeyRecord.userId,
      user?.subscriptionTier || 'free'
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          status: 429,
          timestamp: new Date().toISOString(),
          resetAt: rateLimit.resetAt.toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
          },
        }
      );
    }

    const userId = apiKeyRecord.userId;
    const dataType = request.nextUrl.searchParams.get('type') || 'transactions';
    const days = parseInt(request.nextUrl.searchParams.get('days') || '30', 10);

    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Invalid days parameter. Must be between 1 and 365.' },
        { status: 400 }
      );
    }

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const headers = {
      'X-RateLimit-Limit': String(rateLimit.limitInfo.requestsPerMinute),
      'X-RateLimit-Remaining': String(Math.max(0, rateLimit.remaining)),
      'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
      'Content-Type': 'application/json',
    };

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
        take: 1000,
      });

      return NextResponse.json({ transactions, count: transactions.length }, { headers });
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
        take: 1000,
      });

      return NextResponse.json({ forecasts, count: forecasts.length }, { headers });
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

      return NextResponse.json(
        {
          summary: {
            totalTransactions: transactions.length,
            totalIncome: income,
            totalExpenses: expenses,
            netCashFlow: income - expenses,
            period: `${days} days`,
          },
        },
        { headers }
      );
    }

    return NextResponse.json(
      { error: 'Invalid data type. Must be transactions, forecasts, or summary.' },
      { status: 400, headers }
    );
  } catch (error) {
    console.error('Error fetching public data:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        status: 500,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
