import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { storeSupportMessage, getSupportHistory } from '@/lib/support-chat';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const history = await getSupportHistory(session.user.id, limit);

    return NextResponse.json({ messages: history });
  } catch (error) {
    console.error('Error fetching support messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, metadata } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    await storeSupportMessage(session.user.id, message, true, metadata);

    return NextResponse.json({
      success: true,
      message: 'Message sent to support team',
    });
  } catch (error) {
    console.error('Error sending support message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}