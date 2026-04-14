import { prisma } from './prisma';
import { Decimal } from '@prisma/client/runtime/library';

interface TransactionData {
  date: Date;
  amount: Decimal | number;
}

// Calculate seasonality factor based on historical data
export function calculateSeasonalityFactor(
  historicalData: TransactionData[],
  targetDate: Date
): number {
  if (historicalData.length < 12) {
    return 1.0;
  }

  const targetMonth = targetDate.getMonth();
  const monthlyTotals = new Map<number, Decimal>();

  historicalData.forEach((tx) => {
    const month = new Date(tx.date).getMonth();
    const current = monthlyTotals.get(month) || new Decimal(0);
    monthlyTotals.set(month, current.plus(tx.amount));
  });

  if (monthlyTotals.size === 0) return 1.0;

  const avg = Array.from(monthlyTotals.values())
    .reduce((a, b) => a.plus(b), new Decimal(0))
    .dividedBy(monthlyTotals.size);

  const targetMonthTotal = monthlyTotals.get(targetMonth) || new Decimal(0);
  const factor = targetMonthTotal.equals(0) ? 1.0 : targetMonthTotal.dividedBy(avg).toNumber();

  return Math.max(0.5, Math.min(2.0, factor));
}

// Calculate trend factor
export function calculateTrendFactor(
  historicalData: TransactionData[],
  targetDate: Date
): number {
  if (historicalData.length < 2) {
    return 1.0;
  }

  const sorted = [...historicalData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const n = sorted.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  sorted.forEach((item, index) => {
    const y = new Decimal(item.amount).toNumber();
    sumX += index;
    sumY += y;
    sumXY += index * y;
    sumXX += index * index;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const trendFactor = slope > 0 ? 1.0 + slope * 0.01 : 1.0;
  return Math.max(0.5, Math.min(2.0, trendFactor));
}

// Detect anomalies
export function detectAnomalies(
  value: Decimal | number,
  historicalData: TransactionData[]
): { isAnomaly: boolean; score: number } {
  if (historicalData.length < 5) {
    return { isAnomaly: false, score: 0 };
  }

  const values = historicalData.map((tx) =>
    new Decimal(tx.amount).toNumber()
  );

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const numValue = new Decimal(value).toNumber();
  const zScore = Math.abs((numValue - mean) / (stdDev || 1));

  const anomalyScore = Math.min(1.0, zScore / 3.0);
  const isAnomaly = zScore > 2.5;

  return { isAnomaly, score: anomalyScore };
}

// Generate advanced forecast
export async function generateAdvancedForecast(
  userId: string,
  forecastDate: Date
) {
  try {
    const thirtyDaysAgo = new Date(forecastDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const historicalTx = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: thirtyDaysAgo,
          lte: new Date(),
        },
      },
      select: { date: true, amount: true },
    });

    const seasonality = calculateSeasonalityFactor(historicalTx, forecastDate);
    const trend = calculateTrendFactor(historicalTx, forecastDate);

    const baselineSum = historicalTx.reduce((sum, tx) => sum.plus(tx.amount), new Decimal(0));
    const baseline = baselineSum.dividedBy(Math.max(1, historicalTx.length));

    const baseForecast = baseline.toNumber();
    const adjustedForecast = baseForecast * seasonality * trend;

    const { isAnomaly, score } = detectAnomalies(adjustedForecast, historicalTx);

    const confidence = Math.max(30, 100 - score * 50 - Math.abs(1 - trend) * 20);

    return {
      projectedCashFlow: new Decimal(adjustedForecast),
      seasonalityFactor: new Decimal(seasonality),
      trendFactor: new Decimal(trend),
      anomalyScore: new Decimal(score),
      isAnomaly,
      confidence: Math.round(confidence),
      forecastMethod: 'advanced',
    };
  } catch (error) {
    console.error('Error generating advanced forecast:', error);
    throw error;
  }
}