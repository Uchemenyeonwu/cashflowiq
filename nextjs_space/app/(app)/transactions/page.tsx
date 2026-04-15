import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddButton, EditButton, DeleteButton } from "./_components/transaction-list";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div>Unauthorized</div>;
  }

  const userId = session.user.id;

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-2">
            Manage your income and expenses
          </p>
        </div>
        <AddButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t: any) => (
                    <tr
                      key={t.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {t.description}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            t.type === "income"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-sm font-semibold text-right ${
                        t.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {t.type === "income" ? "+" : "-"}$
                        {Number(t.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <EditButton transaction={t} />
                        <DeleteButton transactionId={t.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No transactions yet.</p>
              <AddButton />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
