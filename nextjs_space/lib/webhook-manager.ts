import { prisma } from './prisma';
import crypto from 'crypto';

export interface WebhookEventData {
  type: 'transaction.created' | 'transaction.updated' | 'forecast.updated';
  data: Record<string, any>;
  timestamp: Date;
}

export async function createWebhook(
  userId: string,
  url: string,
  events: string[],
  description?: string
) {
  try {
    const secret = crypto.randomBytes(32).toString('hex');

    return await prisma.webhook.create({
      data: {
        userId,
        url,
        events,
        secret,
        description,
        isActive: true,
      },
    });
  } catch (error) {
    console.error('Error creating webhook:', error);
    throw error;
  }
}

export async function updateWebhook(
  webhookId: string,
  userId: string,
  data: {
    url?: string;
    events?: string[];
    description?: string;
    isActive?: boolean;
  }
) {
  try {
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || webhook.userId !== userId) {
      throw new Error('Webhook not found');
    }

    return await prisma.webhook.update({
      where: { id: webhookId },
      data,
    });
  } catch (error) {
    console.error('Error updating webhook:', error);
    throw error;
  }
}

export async function deleteWebhook(webhookId: string, userId: string) {
  try {
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || webhook.userId !== userId) {
      throw new Error('Webhook not found');
    }

    return await prisma.webhook.delete({
      where: { id: webhookId },
    });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    throw error;
  }
}

export async function getUserWebhooks(userId: string) {
  try {
    return await prisma.webhook.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    throw error;
  }
}

export function createWebhookSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

export async function triggerWebhook(
  webhookId: string,
  eventData: WebhookEventData,
  maxRetries: number = 3
) {
  try {
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || !webhook.isActive) {
      return;
    }

    const payload = JSON.stringify(eventData);
    const signature = createWebhookSignature(payload, webhook.secret);

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': eventData.type,
          },
          body: payload,
        });

        if (response.ok) {
          return;
        }
      } catch (error) {
        console.error(`Webhook delivery attempt ${attempt + 1} failed:`, error);

        if (attempt < maxRetries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }
  } catch (error) {
    console.error('Error triggering webhook:', error);
  }
}
