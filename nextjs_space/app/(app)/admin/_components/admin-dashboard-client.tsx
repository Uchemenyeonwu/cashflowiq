'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  DollarSign,
  Activity,
  AlertTriangle,
  TrendingUp,
  Database,
  Download,
  Eye,
  Key,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboardClient() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Fetch overview data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [overview, revenue, apiUsage, health, insights] = await Promise.all([
          fetch('/api/admin/analytics/overview').then((r) => r.json()),
          fetch('/api/admin/analytics/revenue').then((r) => r.json()),
          fetch('/api/admin/analytics/api-usage').then((r) => r.json()),
          fetch('/api/admin/analytics/health').then((r) => r.json()),
          fetch('/api/admin/analytics/insights').then((r) => r.json()),
        ]);

        setData({ overview, revenue, apiUsage, health, insights });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/admin/analytics/users?search=${searchQuery}`);
        const result = await response.json();
        setUsers(result.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      });

      if (response.ok) {
        toast({ title: 'Success', description: `Password reset for ${selectedUser.email}` });
        setShowPasswordReset(false);
        setNewPassword('');
      } else {
        toast({ title: 'Error', description: 'Failed to reset password', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reset password', variant: 'destructive' });
    }
  };

  const handleExport = (type: string) => {
    window.location.href = `/api/admin/export?type=${type}&format=csv`;
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('revenue')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'revenue' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
          }`}
        >
          Revenue
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'api' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
          }`}
        >
          API & Health
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold mt-2">{data.overview?.users?.total || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Active: {data.overview?.users?.active || 0}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New Users (This Month)</p>
                  <p className="text-3xl font-bold mt-2">{data.overview?.users?.newThisMonth || 0}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total MRR</p>
                  <p className="text-3xl font-bold mt-2">${data.revenue?.totalMRR?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {data.revenue?.activeSubscriptions || 0} active subscriptions
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Status</p>
                  <p className="text-3xl font-bold mt-2">{data.health?.system?.status || 'unknown'}</p>
                  <p className="text-xs text-gray-500 mt-1">Response: {data.health?.system?.avgResponseTimeMs}ms</p>
                </div>
                <Activity className={`w-10 h-10 ${data.health?.system?.status === 'healthy' ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">API Usage</p>
                  <p className="text-3xl font-bold mt-2">{data.apiUsage?.requests?.total || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Error Rate: {data.apiUsage?.requests?.errorRate?.toFixed(2) || '0'}%
                  </p>
                </div>
                <Database className="w-10 h-10 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Plaid Sync Health</p>
                  <p className="text-3xl font-bold mt-2">{data.health?.plaidSync?.successfulSyncs || 0}/{data.health?.plaidSync?.totalSyncs || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Failed: {data.health?.plaidSync?.failedSyncs || 0}
                  </p>
                </div>
                <AlertTriangle className={`w-10 h-10 ${data.health?.plaidSync?.failedSyncs > 0 ? 'text-red-500' : 'text-green-500'}`} />
              </div>
            </Card>
          </div>

          {/* Subscription Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">User Subscription Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(data.overview?.users?.byTier || {}).map(([tier, count]) => ({
                    name: tier,
                    value: count,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {['free', 'solo', 'pro', 'team'].map((tier, idx) => (
                    <Cell key={tier} fill={['#ef4444', '#f97316', '#3b82f6', '#10b981'][idx] || '#8884d8'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => handleExport('users')} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {selectedUser ? (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">User Details: {selectedUser.email}</h3>
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Back
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-medium">{selectedUser.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Subscription Tier</p>
                  <p className="text-lg font-medium">{selectedUser.subscriptionTier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Joined</p>
                  <p className="text-lg font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-lg font-medium">{selectedUser._count?.transactions || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="text-lg font-medium">
                    {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>

              {showPasswordReset ? (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <Input
                    type="password"
                    placeholder="Enter new password (min 8 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mb-3"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handlePasswordReset} className="bg-blue-600">
                      Reset Password
                    </Button>
                    <Button variant="outline" onClick={() => setShowPasswordReset(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setShowPasswordReset(true)} className="mt-6" variant="destructive">
                  Reset Password
                </Button>
              )}
            </Card>
          ) : (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Users List</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.length === 0 ? (
                  <p className="text-gray-500">No users found</p>
                ) : (
                  users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-gray-600">{user.name || 'No name'} • {user.subscriptionTier}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => handleExport('revenue')} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(data.revenue?.monthlyRevenue || {}).map(([month, value]) => ({ month, revenue: value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">MRR by Tier</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(data.revenue?.mrrByTier || {}).map(([tier, mrr]) => (
                <div key={tier} className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 capitalize">{tier} Tier</p>
                  <p className="text-2xl font-bold mt-2">${(mrr as number).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Subscription Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={(data.revenue?.subscriptionsByTier || []).map((item: any) => ({
                    name: `${item.tier} (${item.status})`,
                    value: item.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* API & Health Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => handleExport('api')} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export API Data
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">API Keys</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Total Keys</p>
                  <p className="text-3xl font-bold">{data.apiUsage?.apiKeys?.total || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{data.apiUsage?.apiKeys?.active || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Plaid Sync Status</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold">
                    {data.health?.plaidSync?.totalSyncs > 0
                      ? (
                          ((data.health?.plaidSync?.successfulSyncs || 0) / data.health?.plaidSync?.totalSyncs) *
                          100
                        ).toFixed(1)
                      : 'N/A'}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Errors</p>
                  <p className="text-2xl font-bold text-red-600">{data.health?.plaidSync?.activeSyncErrors || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top API Endpoints</h3>
            <div className="space-y-2">
              {(data.apiUsage?.topEndpoints || []).map((endpoint: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 border rounded">
                  <p className="font-mono text-sm">{endpoint.endpoint}</p>
                  <p className="text-gray-600">{endpoint.count} calls</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
