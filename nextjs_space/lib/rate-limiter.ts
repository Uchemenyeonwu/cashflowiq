import { prisma } from './prisma';
import { getRedisClient } from './redis';

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerDay: number;
  burst?: number;
}

const TIER_LIMITS: Record<string, RateLimitConfig> = {
  free: {
    requestsPerMinute: 10,
    requestsPerDay: 1000,
    burst: 15,
  },
  solo: {
    requestsPerMinute: 100,
    requestsPerDay: 50000,
    burst: 150,
  },
  pro: {
    requestsPerMinute: 1000,
    requestsPerDay: 500000,
    burst: 1500,
  },
  team: {
    requestsPerMinute: 5000,
    requestsPerDay: 2000000,
    burst: 7500,
  },
};

export async function checkRateLimit(
  apiKeyId: string,
  userId: string,
  userTier: string = 'free'
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limitInfo: RateLimitConfig;
}> {
  try {
    const redis = await getRedisClient();
    const config = TIER_LIMITS[userTier] || TIER_LIMITS.free;

    const now = new Date();
    const minuteKey = `ratelimit:${apiKeyId}:minute:${Math.floor(now.getTime() / 60000)}`;
    const dayKey = `ratelimit:${apiKeyId}:day:${now.toISOString().split('T')[0]}`;

    const currentMinute = await redis.incr(minuteKey);
    if (currentMinute === 1) {
      await redis.expire(minuteKey, 60);
    }

    const currentDay = await redis.incr(dayKey);
    if (currentDay === 1) {
      await redis.expire(dayKey, 86400);
    }

    const minuteLimit = config.burst || config.requestsPerMinute;
    const dayLimit = config.requestsPerDay;

    const minuteAllowed = currentMinute <= minuteLimit;
    const dayAllowed = currentDay <= dayLimit;
    const allowed = minuteAllowed && dayAllowed;

    const resetMinuteAt = new Date(Math.floor(now.getTime() / 60000) * 60000 + 60000);
    const resetDayAt = new Date(now);
    resetDayAt.setDate(resetDayAt.getDate() + 1);
    resetDayAt.setHours(0, 0, 0, 0);

    const resetAt = minuteAllowed ? resetDayAt : resetMinuteAt;

    if (allowed) {
      try {
        await prisma.apiKey.update({
          where: { id: apiKeyId },
          data: {
            requestCount: { increment: 1 },
            lastUsedAt: now,
          },
        });
      } catch (error) {
        console.error('Error updating API key usage:', error);
      }
    }

    return {
      allowed,
      remaining: Math.max(0, minuteLimit - currentMinute),
      resetAt,
      limitInfo: config,
    };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return {
      allowed: true,
      remaining: 100,
      resetAt: new Date(),
      limitInfo: TIER_LIMITS.free,
    };
  }
}

export async function getApiKeyUsage(apiKeyId: string, days: number = 30) {
  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: apiKeyId },
      include: {
        user: {
          select: {
            subscriptionTier: true,
          },
        },
      },
    });

    if (!apiKey) {
      return null;
    }

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const config = TIER_LIMITS[apiKey.user.subscriptionTier || 'free'];

    return {
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
        lastUsedAt: apiKey.lastUsedAt,
      },
      tier: apiKey.user.subscriptionTier || 'free',
      limits: config,
      totalRequests: apiKey.requestCount,
    };
  } catch (error) {
    console.error('Error getting API key usage:', error);
    return null;
  }
}
