import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Plus, BarChart3, Link as LinkIcon } from "lucide-react";
import DashboardChart from "./_components/dashboard-chart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div>Unauthorized</div>;
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: monthStart },
    },
  });

  const income = transactions
    .filter((t: any) => t.type === "income")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter((t: any) => t.type === "expense")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const cashBalance = income - expenses;
  const monthlyBurnRate = expenses;

  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: now,
        lte: sevenDaysFromNow,
      },
    },
    orderBy: { date: "asc" },
    take: 5,
  });

  const forecasts = await prisma.forecast.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    take: 90,
  });

  const chartData = forecasts.map((f: any) => ({
    date: new Date(f.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    projected: Number(f.projectedCashFlow),
    confidence: f.confidence ?? 0,
  }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name || "User"}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Current Cash Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              ${cashBalance.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              30-Day Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${income.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-2">Income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Burn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              ${monthlyBurnRate.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-2">Expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Runway
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {monthlyBurnRate > 0
                ? Math.floor((cashBalance / monthlyBurnRate) * 30)
                : "∞"}
            </div>
            <p className="text-xs text-gray-500 mt-2">Days</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>90-Day Cash Flow Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <DashboardChart data={chartData} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Upcoming Transactions (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTransactions.length > 0 ? (
              <div className="space-y-3">
                {upcomingTransactions.map((t: any) => (
                  <div
                    key={t.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {t.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(t.date).toLocaleDateString()} •{" "}
                        <span
                          className={t.type === "income" ? "text-green-600" : "text-red-600"}
                        >
                          {t.type === "income" ? "+" : "-"}$
                          {Number(t.amount).toFixed(2)}
                        </span>
                      </p>
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      {t.category}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No upcoming transactions</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/transactions" className="block">
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </Link>
            <Link href="/reports" className="block">
              <Button
                variant="outline"
                className="w-full justify-start"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Reports
              </Button>
            </Link>
            <Link href="/settings" className="block">
              <Button
                variant="outline"
                className="w-full justify-start"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Connect Bank
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
