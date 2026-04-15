import { prisma } from './prisma';

const cache = new Map<string, { data: any; expiresAt: number }>();

const CACHE_TTL = {
  SHORT: 5 * 60 * 1000,
  MEDIUM: 30 * 60 * 1000,
  LONG: 24 * 60 * 60 * 1000,
};

// Get cached value
export function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;

  if (cached.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
}

// Set cached value
export function setCached<T>(key: string, data: T, ttl: number = CACHE_TTL.MEDIUM): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  });
}

// Clear cache for a pattern
export function clearCachePattern(pattern: string): void {
  const regex = new RegExp(pattern);
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

// Get or set cached value
export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
  const cached = getCached<T>(key);
  if (cached) return cached;

  const data = await fetcher();
  setCached(key, data, ttl);
  return data;
}

// Cache user dashboard data
export async function getCachedUserDashboard(userId: string) {
  const key = `dashboard:${userId}`;
  return getCachedOrFetch(
    key,
    async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          linkedAccounts: true,
          stripeCustomer: true,
        },
      });
      return user;
    },
    CACHE_TTL.SHORT
  );
}

// Clear dashboard cache
export function clearDashboardCache(userId: string): void {
  cache.delete(`dashboard:${userId}`);
}

// Cache transaction summary
export async function getCachedTransactionSummary(
  userId: string,
  days: number = 30
) {
  const key = `tx_summary:${userId}:${days}`;
  return getCachedOrFetch(
    key,
    async () => {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);

      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: dateFrom },
        },
      });

      const income = transactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: any, t: any) => sum + parseFloat(t.amount.toString()), 0);

      const expenses = transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: any, t: any) => sum + parseFloat(t.amount.toString()), 0);

      return {
        totalTransactions: transactions.length,
        totalIncome: income,
        totalExpenses: expenses,
        netCashFlow: income - expenses,
      };
    },
    CACHE_TTL.MEDIUM
  );
}

// Clear transaction cache
export function clearTransactionCache(userId: string): void {
  clearCachePattern(`^tx_summary:${userId}:.*`);
}

// Cache team members
export async function getCachedTeamMembers(teamId: string) {
  const key = `team_members:${teamId}`;
  return getCachedOrFetch(
    key,
    async () => {
      return await prisma.teamMember.findMany({
        where: { teamId },
        include: { user: true },
      });
    },
    CACHE_TTL.LONG
  );
}

// Clear team cache
export function clearTeamCache(teamId: string): void {
  cache.delete(`team_members:${teamId}`);
}