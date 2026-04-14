import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { updateWebhook, deleteWebhook } from '@/lib/webhook-manager';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { webhookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const webhook = await updateWebhook(params.webhookId, session.user.id, data);
    return NextResponse.json(webhook);
  } catch (error: any) {
    if (error.message === 'Webhook not found') {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }
    console.error('Error updating webhook:', error);
    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { webhookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteWebhook(params.webhookId, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Webhook not found') {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }
    console.error('Error deleting webhook:', error);
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}
