import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createSharedDashboard, getTeamSharedDashboards } from '@/lib/shared-dashboard';
import { hasTeamPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await hasTeamPermission(
      session.user.id,
      params.teamId,
      'read'
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const dashboards = await getTeamSharedDashboards(params.teamId);
    return NextResponse.json(dashboards);
  } catch (error) {
    console.error('Error fetching shared dashboards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared dashboards' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await hasTeamPermission(
      session.user.id,
      params.teamId,
      'create'
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description, widgets, layout } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Dashboard name is required' },
        { status: 400 }
      );
    }

    const dashboard = await createSharedDashboard(
      params.teamId,
      session.user.id,
      name,
      description,
      widgets,
      layout
    );

    return NextResponse.json(dashboard, { status: 201 });
  } catch (error) {
    console.error('Error creating shared dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to create shared dashboard' },
      { status: 500 }
    );
  }
}