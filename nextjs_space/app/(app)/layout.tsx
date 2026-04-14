import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, BarChart3, TrendingUp, Settings, Home, LineChart, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import LogoutButton from "./_components/logout-button";
import { SageFloatingWidget } from "@/components/sage-floating-widget";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">CashFlowIQ</h1>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <Home className="w-5 h-5 mr-3" />
              Dashboard
            </Button>
          </Link>
          <Link href="/transactions">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <TrendingUp className="w-5 h-5 mr-3" />
              Transactions
            </Button>
          </Link>
          <Link href="/reports">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              Reports
            </Button>
          </Link>
          <Link href="/analytics">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <LineChart className="w-5 h-5 mr-3" />
              Analytics
            </Button>
          </Link>
          <Link href="/support">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <HelpCircle className="w-5 h-5 mr-3" />
              Support
            </Button>
          </Link>
          <Link href="/settings">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </Button>
          </Link>
        </nav>

        <div className="p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-4">
            <p className="font-medium">{session.user?.name}</p>
            <p className="text-xs">{session.user?.email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Sage Floating Widget */}
      <SageFloatingWidget />
    </div>
  );
}
