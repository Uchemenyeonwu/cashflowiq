import { NextRequest, NextResponse } from 'next/server';
import { getSharedDashboardByToken } from '@/lib/shared-dashboard';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const dashboard = await getSharedDashboardByToken(params.token);

    if (!dashboard) {
      return NextResponse.json(
        { error: 'Dashboard not found or not public' },
        { status: 404 }
      );
    }

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Error fetching shared dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared dashboard' },
      { status: 500 }
    );
  }
}