import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { deleteUserAndData } from '@/lib/compliance';
import { signOut } from 'next-auth/react';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { confirmPhrase } = await request.json();

    if (confirmPhrase !== 'DELETE MY ACCOUNT AND DATA') {
      return NextResponse.json(
        { error: 'Invalid confirmation phrase' },
        { status: 400 }
      );
    }

    await deleteUserAndData(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'User account and all associated data have been permanently deleted',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}