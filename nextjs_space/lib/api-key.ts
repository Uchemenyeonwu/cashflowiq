import { prisma } from './prisma';
import crypto from 'crypto';

// Generate a new API key
export async function generateApiKey(
  userId: string,
  name: string,
  description?: string
) {
  try {
    const keyPrefix = 'cfiq_';
    const randomKey = crypto.randomBytes(32).toString('hex');
    const fullKey = keyPrefix + randomKey;

    const keyHash = crypto
      .createHash('sha256')
      .update(fullKey)
      .digest('hex');

    await prisma.apiKey.create({
      data: {
        userId,
        keyHash,
        name,
        description,
      },
    });

    return { key: fullKey, keyHash };
  } catch (error) {
    console.error('Error generating API key:', error);
    throw error;
  }
}

// Verify API key
export async function verifyApiKey(key: string) {
  try {
    const keyHash = crypto
      .createHash('sha256')
      .update(key)
      .digest('hex');

    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: { user: true },
    });

    if (!apiKey || !apiKey.isActive) {
      return null;
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return apiKey;
  } catch (error) {
    console.error('Error verifying API key:', error);
    return null;
  }
}

// Get user's API keys
export async function getUserApiKeys(userId: string) {
  try {
    return await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        lastUsedAt: true,
        expiresAt: true,
        isActive: true,
        createdAt: true,
        rateLimit: true,
      },
    });
  } catch (error) {
    console.error('Error fetching user API keys:', error);
    throw error;
  }
}

// Revoke API key
export async function revokeApiKey(keyId: string, userId: string) {
  try {
    return await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false },
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    throw error;
  }
}