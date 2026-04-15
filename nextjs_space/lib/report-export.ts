import { prisma } from './prisma';
import { Decimal } from '@prisma/client/runtime/library';

export interface ExportOptions {
  reportType: 'cash_flow' | 'category_breakdown' | 'monthly_comparison' | 'full_report';
  fileFormat: 'pdf' | 'xlsx';
  dateRangeStart: Date;
  dateRangeEnd: Date;
  teamId?: string;
}

// Create export record
export async function createExportRecord(
  userId: string,
  options: ExportOptions
) {
  try {
    const fileName = `${options.reportType}_${new Date().toISOString().slice(0, 10)}.${options.fileFormat}`;
    
    return await prisma.reportExport.create({
      data: {
        userId,
        teamId: options.teamId,
        reportType: options.reportType,
        fileFormat: options.fileFormat,
        fileName,
        dateRangeStart: options.dateRangeStart,
        dateRangeEnd: options.dateRangeEnd,
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error('Error creating export record:', error);
    throw error;
  }
}

// Update export record with completion details
export async function updateExportRecord(
  exportId: string,
  updates: {
    status: string;
    filePath?: string;
    fileSize?: number;
    errorMessage?: string;
  }
) {
  try {
    return await prisma.reportExport.update({
      where: { id: exportId },
      data: {
        ...updates,
        completedAt: updates.status === 'completed' ? new Date() : undefined,
      },
    });
  } catch (error) {
    console.error('Error updating export record:', error);
    throw error;
  }
}

// Get user's export history
export async function getUserExports(userId: string, limit: number = 10) {
  try {
    return await prisma.reportExport.findMany({
      where: { userId, status: 'completed' },
      orderBy: { completedAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('Error fetching user exports:', error);
    throw error;
  }
}

// Generate cash flow report data
export async function generateCashFlowReportData(
  userId: string,
  dateStart: Date,
  dateEnd: Date
) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: dateStart,
          lte: dateEnd,
        },
      },
      orderBy: { date: 'asc' },
    });

    const dailyData = new Map<string, { income: Decimal; expense: Decimal }>();

    transactions.forEach((tx: any) => {
      const dateKey = tx.date.toISOString().slice(0, 10);
      const current = dailyData.get(dateKey) || { income: new Decimal(0), expense: new Decimal(0) };

      if (tx.type === 'income') {
        current.income = current.income.plus(tx.amount);
      } else {
        current.expense = current.expense.plus(tx.amount);
      }
      dailyData.set(dateKey, current);
    });

    const reportData = Array.from(dailyData.entries()).map(([date, data]) => ({
      date,
      income: data.income.toNumber(),
      expense: data.expense.toNumber(),
      netCashFlow: data.income.minus(data.expense).toNumber(),
    }));

    const totals = reportData.reduce(
      (acc, row) => ({
        totalIncome: acc.totalIncome + row.income,
        totalExpense: acc.totalExpense + row.expense,
        totalNetCashFlow: acc.totalNetCashFlow + row.netCashFlow,
      }),
      { totalIncome: 0, totalExpense: 0, totalNetCashFlow: 0 }
    );

    return { reportData, totals };
  } catch (error) {
    console.error('Error generating cash flow report data:', error);
    throw error;
  }
}

// Generate category breakdown data
export async function generateCategoryBreakdownData(
  userId: string,
  dateStart: Date,
  dateEnd: Date
) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: dateStart,
          lte: dateEnd,
        },
      },
    });

    const categoryData = new Map<string, Decimal>();

    transactions.forEach((tx: any) => {
      const current = categoryData.get(tx.category) || new Decimal(0);
      categoryData.set(tx.category, current.plus(tx.amount));
    });

    const reportData = Array.from(categoryData.entries()).map(([category, amount]) => ({
      category,
      amount: amount.toNumber(),
      percentage: 0,
    }));

    const total = reportData.reduce((sum: any, item: any) => sum + item.amount, 0);
    reportData.forEach((item: any) => {
      item.percentage = total > 0 ? Math.round((item.amount / total) * 100) : 0;
    });

    return { reportData, total };
  } catch (error) {
    console.error('Error generating category breakdown data:', error);
    throw error;
  }
}

// Generate monthly comparison data
export async function generateMonthlyComparisonData(
  userId: string,
  dateStart: Date,
  dateEnd: Date
) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: dateStart,
          lte: dateEnd,
        },
      },
    });

    const monthlyData = new Map<string, { income: Decimal; expense: Decimal }>();

    transactions.forEach((tx: any) => {
      const monthKey = tx.date.toISOString().slice(0, 7);
      const current = monthlyData.get(monthKey) || { income: new Decimal(0), expense: new Decimal(0) };

      if (tx.type === 'income') {
        current.income = current.income.plus(tx.amount);
      } else {
        current.expense = current.expense.plus(tx.amount);
      }
      monthlyData.set(monthKey, current);
    });

    const reportData = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        income: data.income.toNumber(),
        expense: data.expense.toNumber(),
        netCashFlow: data.income.minus(data.expense).toNumber(),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { reportData };
  } catch (error) {
    console.error('Error generating monthly comparison data:', error);
    throw error;
  }
}