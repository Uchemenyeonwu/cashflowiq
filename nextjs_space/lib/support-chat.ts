import { prisma } from './prisma';

export interface SupportMessage {
  userId: string;
  message: string;
  isUserMessage: boolean;
  metadata?: Record<string, any>;
}

// Store support message
export async function storeSupportMessage(
  userId: string,
  message: string,
  isUserMessage: boolean,
  metadata?: Record<string, any>
) {
  try {
    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        keyHash: `support:${userId}:${Date.now()}`,
        name: 'support-message',
        description: JSON.stringify({
          message,
          isUserMessage,
          timestamp: new Date(),
          metadata,
        }),
      },
    });
    return apiKey;
  } catch (error) {
    console.error('Error storing support message:', error);
    throw error;
  }
}

// Get support conversation history
export async function getSupportHistory(
  userId: string,
  limit: number = 50
) {
  try {
    const messages = await prisma.apiKey.findMany({
      where: {
        userId,
        name: 'support-message',
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.map((m: any) => {
      const data = m.description ? JSON.parse(m.description) : {};
      return {
        id: m.id,
        ...data,
      };
    });
  } catch (error) {
    console.error('Error fetching support history:', error);
    throw error;
  }
}