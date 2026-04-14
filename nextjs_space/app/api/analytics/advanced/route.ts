import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import {
  calculateCohorts,
  calculateForecastMetrics,
  calculateSeasonality,
  getAnomalies,
} from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metricsType = request.nextUrl.searchParams.get('type') || 'all';
    const days = parseInt(request.nextUrl.searchParams.get('days') || '30', 10);

    const result: Record<string, any> = {};

    if (metricsType === 'cohorts' || metricsType === 'all') {
      result.cohorts = await calculateCohorts(session.user.id);
    }

    if (metricsType === 'forecast' || metricsType === 'all') {
      result.forecastMetrics = await calculateForecastMetrics(session.user.id, days);
    }

    if (metricsType === 'seasonality' || metricsType === 'all') {
      result.seasonality = await calculateSeasonality(session.user.id, 12);
    }

    if (metricsType === 'anomalies' || metricsType === 'all') {
      result.anomalies = await getAnomalies(session.user.id, days);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching advanced analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
