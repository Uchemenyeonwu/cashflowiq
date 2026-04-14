import { prisma } from '@/lib/db';
import { plaidClient } from '@/lib/plaid';
import { Decimal } from '@prisma/client/runtime/library';

export async function syncPlaidTransactions(linkedAccountId: string) {
  try {
    const linkedAccount = await prisma.linkedAccount.findUnique({
      where: { id: linkedAccountId },
      include: { syncCursors: true },
    });

    if (!linkedAccount) {
      throw new Error('Linked account not found');
    }

    await prisma.linkedAccount.update({
      where: { id: linkedAccountId },
      data: { syncStatus: 'syncing' },
    });

    let cursor: string | null = linkedAccount.syncCursors[0]?.cursor || null;
    const added: any[] = [];
    const modified: any[] = [];
    const removed: any[] = [];
    let hasMore = true;

    // Fetch transactions using cursor-based pagination
    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: linkedAccount.plaidAccessToken,
        cursor: cursor || undefined,
      });

      added.push(...response.data.added);
      modified.push(...response.data.modified);
      removed.push(...response.data.removed);

      hasMore = response.data.has_more;
      cursor = response.data.next_cursor;
    }

    // Process removed transactions
    for (const transaction of removed) {
      await prisma.transaction.deleteMany({
        where: {
          plaidTransactionId: transaction.transaction_id,
          userId: linkedAccount.userId,
        },
      });
    }

    // Process added and modified transactions
    const allTransactions = [...added, ...modified];
    for (const plaidTx of allTransactions) {
      const amount = Math.abs(parseFloat(plaidTx.amount));
      const type = plaidTx.amount < 0 ? 'income' : 'expense';
      const category = mapPlaidCategory(plaidTx.personal_finance_category?.primary || 'OTHER');

      // Check if transaction already exists
      const existingTx = await prisma.transaction.findFirst({
        where: {
          plaidTransactionId: plaidTx.transaction_id,
          userId: linkedAccount.userId,
        },
      });

      if (existingTx) {
        // Update existing transaction
        await prisma.transaction.update({
          where: { id: existingTx.id },
          data: {
            amount: new Decimal(amount),
            category,
            date: new Date(plaidTx.date),
            description: plaidTx.name,
          },
        });
      } else {
        // Create new transaction
        await prisma.transaction.create({
          data: {
            userId: linkedAccount.userId,
            plaidTransactionId: plaidTx.transaction_id,
            linkedAccountId,
            type,
            amount: new Decimal(amount),
            category,
            date: new Date(plaidTx.date),
            description: plaidTx.name,
            source: 'plaid',
          },
        });
      }
    }

    // Update sync cursor and status
    if (cursor) {
      const syncCursor = linkedAccount.syncCursors[0];
      if (syncCursor) {
        await prisma.syncCursor.update({
          where: { id: syncCursor.id },
          data: {
            cursor,
            lastSyncedAt: new Date(),
          },
        });
      } else {
        await prisma.syncCursor.create({
          data: {
            linkedAccountId,
            cursor,
          },
        });
      }
    }

    // Update linked account status
    await prisma.linkedAccount.update({
      where: { id: linkedAccountId },
      data: {
        syncStatus: 'success',
        lastSyncedAt: new Date(),
        syncError: null,
      },
    });

    console.log(
      `Synced ${added.length} new, ${modified.length} modified, ${removed.length} removed transactions for account ${linkedAccountId}`
    );
  } catch (error: any) {
    console.error(`Error syncing transactions for account ${linkedAccountId}:`, error);
    await prisma.linkedAccount.update({
      where: { id: linkedAccountId },
      data: {
        syncStatus: 'error',
        syncError: error.message,
      },
    });
    throw error;
  }
}

function mapPlaidCategory(plaidCategory: string): string {
  const categoryMap: { [key: string]: string } = {
    'FOOD_AND_DRINK': 'Food & Drink',
    'TRAVEL': 'Travel',
    'TRANSFER': 'Transfer',
    'RENT_AND_UTILITIES': 'Utilities',
    'ENTERTAINMENT': 'Entertainment',
    'MEDICAL': 'Medical',
    'PERSONAL': 'Personal',
    'INCOME': 'Income',
    'LOAN_PAYMENTS': 'Loan Payment',
    'TAXES': 'Taxes',
    'BUSINESS_SERVICES': 'Business',
    'SHOPS': 'Shopping',
    'INTERNET_AND_CABLE': 'Internet',
  };

  return categoryMap[plaidCategory] || 'Other';
}
