import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { exportUserData, createAnonymizedExport } from '@/lib/compliance';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { format } = await request.json();

    if (format === 'anonymized') {
      const anonymized = await createAnonymizedExport(session.user.id);
      return NextResponse.json(anonymized);
    } else {
      const data = await exportUserData(session.user.id);
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}