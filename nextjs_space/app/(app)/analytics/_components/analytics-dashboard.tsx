'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface CohortAnalysis {
  segment: string;
  count: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  averageDailyBurn: number;
  runway: number;
}

interface ForecastMetrics {
  accuracy: number;
  mae: number;
  rmse: number;
  mape: number;
  trend: string;
  confidence: number;
}

interface SeasonalityAnalysis {
  month: string;
  avgIncome: number;
  avgExpenses: number;
  seasonalFactor: number;
  volatility: number;
}

interface Anomaly {
  date: string;
  amount: number;
  confidence: number;
  severity: string;
}

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    cohorts?: CohortAnalysis[];
    forecastMetrics?: ForecastMetrics;
    seasonality?: SeasonalityAnalysis[];
    anomalies?: Anomaly[];
  }>({});

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/analytics/advanced');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Forecast Metrics */}
      {data.forecastMetrics && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Forecast Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {data.forecastMetrics.accuracy.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on {data.forecastMetrics.confidence}% confidence
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Mean Error</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                ${data.forecastMetrics.mae.toFixed(0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Average absolute error</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-2">
                {data.forecastMetrics.trend === 'improving' ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : data.forecastMetrics.trend === 'declining' ? (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                ) : (
                  <div className="w-6 h-6 text-gray-400">–</div>
                )}
                <span className="text-lg font-semibold capitalize">
                  {data.forecastMetrics.trend}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Data Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {data.forecastMetrics.confidence}
              </div>
              <p className="text-xs text-gray-500 mt-1">High confidence forecasts</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cohort Analysis */}
      {data.cohorts && data.cohorts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cohort Analysis by Category</CardTitle>
            <CardDescription>
              Understand which expense categories impact your cash flow most
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.cohorts.map((cohort, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{cohort.segment}</h4>
                      <p className="text-sm text-gray-600">
                        {cohort.count} transactions
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${
                          cohort.netCashFlow >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        ${cohort.netCashFlow.toFixed(2)}
                      </div>
                      <p className="text-xs text-gray-500">Net cash flow</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Income</p>
                      <p className="font-semibold text-green-600">
                        ${cohort.totalIncome.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Expenses</p>
                      <p className="font-semibold text-red-600">
                        ${cohort.totalExpenses.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Daily Burn</p>
                      <p className="font-semibold">
                        ${cohort.averageDailyBurn.toFixed(0)}/day
                      </p>
                    </div>
                  </div>

                  {cohort.runway < 180 && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">
                        {cohort.runway} days of runway at current burn rate
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seasonality Analysis */}
      {data.seasonality && data.seasonality.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Seasonality Analysis</CardTitle>
            <CardDescription>
              Income and expense patterns throughout the year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.seasonality}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgIncome" fill="#10b981" name="Avg Income" />
                <Bar dataKey="avgExpenses" fill="#ef4444" name="Avg Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Anomalies */}
      {data.anomalies && data.anomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Anomalies</CardTitle>
            <CardDescription>
              Unusual cash flow patterns detected by our ML model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.anomalies.slice(0, 10).map((anomaly, idx) => (
                <div key={idx} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      ${Math.abs(anomaly.amount).toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(anomaly.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      anomaly.severity === 'high'
                        ? 'bg-red-100 text-red-800'
                        : anomaly.severity === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {anomaly.severity.toUpperCase()} ({anomaly.confidence}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
