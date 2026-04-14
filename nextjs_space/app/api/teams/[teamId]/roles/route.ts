import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasTeamPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function PUT(
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
      'manage_roles'
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, newRole } = await request.json();

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: 'User ID and new role are required' },
        { status: 400 }
      );
    }

    const validRoles = ['owner', 'manager', 'member', 'viewer'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const updatedMember = await prisma.teamMember.update({
      where: {
        teamId_userId: { teamId: params.teamId, userId },
      },
      data: { role: newRole },
    });

    return NextResponse.json(updatedMember);
  } catch (error: any) {
    console.error('Error updating member role:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    );
  }
}