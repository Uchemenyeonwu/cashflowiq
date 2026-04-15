import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReportsCharts from "./_components/reports-charts";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div>Unauthorized</div>;
  }

  const userId = session.user.id;
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: ninetyDaysAgo },
    },
    orderBy: { date: "asc" },
  });

  // Calculate summary stats
  const income = transactions
    .filter((t: any) => t.type === "income")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter((t: any) => t.type === "expense")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const netCashFlow = income - expenses;

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  transactions.forEach((t: any) => {
    if (!categoryBreakdown[t.category]) {
      categoryBreakdown[t.category] = 0;
    }
    categoryBreakdown[t.category] += Number(t.amount);
  });

  // Monthly data
  const monthlyData: Record<string, { income: number; expense: number }> = {};
  transactions.forEach((t: any) => {
    const month = new Date(t.date).toLocaleString("default", {
      year: "numeric",
      month: "short",
    });

    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expense: 0 };
    }

    if (t.type === "income") {
      monthlyData[month].income += Number(t.amount);
    } else {
      monthlyData[month].expense += Number(t.amount);
    }
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">Analyze your cash flow data</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Income (90 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${income.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Expenses (90 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              ${expenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Net Cash Flow (90 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                netCashFlow >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${netCashFlow.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <ReportsCharts
        categoryData={Object.entries(categoryBreakdown).map(([name, value]) => ({
          name,
          value,
        }))}
        monthlyData={Object.entries(monthlyData).map(([month, data]) => ({
          month,
          income: data.income,
          expense: data.expense,
        }))}
      />
    </div>
  );
}
