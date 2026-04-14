import { NextRequest, NextResponse } from 'next/server';
import { enqueueSyncJob } from '@/lib/queue';
import { prisma } from '@/lib/db';

interface PlaidWebhookPayload {
  webhook_type: string;
  webhook_code: string;
  item_id: string;
  error?: any;
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as PlaidWebhookPayload;

    console.log('Received Plaid webhook:', payload);

    const linkedAccount = await prisma.linkedAccount.findUnique({
      where: { plaidItemId: payload.item_id },
    });

    if (!linkedAccount) {
      console.warn('Linked account not found for item:', payload.item_id);
      return NextResponse.json({ success: true });
    }

    // Handle different webhook types
    switch (payload.webhook_type) {
      case 'TRANSACTIONS':
        if (payload.webhook_code === 'SYNC_UPDATES_AVAILABLE') {
          // Enqueue the sync job for background processing
          console.log('Enqueuing sync for account:', linkedAccount.id);
          try {
            await enqueueSyncJob(linkedAccount.id);
          } catch (error) {
            console.error('Failed to enqueue sync job:', error);
          }
        }
        break;
      case 'ITEM':
        if (payload.webhook_code === 'WEBHOOK_UPDATE_ACKNOWLEDGED') {
          console.log('Webhook acknowledged for item:', payload.item_id);
        } else if (payload.webhook_code === 'ERROR') {
          console.error('Plaid error for item:', payload.item_id, payload.error);
          await prisma.linkedAccount.update({
            where: { id: linkedAccount.id },
            data: {
              syncStatus: 'error',
              syncError: payload.error?.error_message || 'Plaid error',
            },
          });
        }
        break;
      default:
        console.log('Unhandled webhook type:', payload.webhook_type);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook error' },
      { status: 500 }
    );
  }
}
