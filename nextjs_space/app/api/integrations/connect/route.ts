import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { storeIntegrationCredentials } from '@/lib/integrations';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider, accessToken, refreshToken, realm, accountId, tenantId } = await request.json();

    if (!provider || !accessToken) {
      return NextResponse.json(
        { error: 'Provider and access token are required' },
        { status: 400 }
      );
    }

    await storeIntegrationCredentials(session.user.id, {
      provider,
      accessToken,
      refreshToken,
      realm,
      accountId,
      tenantId,
    });

    return NextResponse.json({
      success: true,
      message: `Connected to ${provider}`,
    });
  } catch (error) {
    console.error('Error connecting integration:', error);
    return NextResponse.json(
      { error: 'Failed to connect integration' },
      { status: 500 }
    );
  }
}