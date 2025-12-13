"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Users,
  Car,
  Database,
  Activity,
  TrendingUp,
  MapPin,
  Search,
  MoreVertical,
  Shield,
  Settings,
  Download,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const systemStats = [
  { month: "Aug", users: 8420, vehicles: 9840, dataPoints: 12500000 },
  { month: "Sep", users: 8950, vehicles: 10150, dataPoints: 13200000 },
  { month: "Oct", users: 9380, vehicles: 10420, dataPoints: 13800000 },
  { month: "Nov", users: 9820, vehicles: 10680, dataPoints: 14500000 },
  { month: "Dec", users: 10150, vehicles: 10890, dataPoints: 15100000 },
  { month: "Jan", users: 10487, vehicles: 11245, dataPoints: 15600000 },
]

const users = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    role: "Vehicle Owner",
    vehicles: 2,
    status: "active",
    joined: "2024-06-15",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    role: "Researcher",
    vehicles: 0,
    status: "active",
    joined: "2024-08-22",
  },
  {
    id: 3,
    name: "Mike Davis",
    email: "mdavis@email.com",
    role: "Vehicle Owner",
    vehicles: 3,
    status: "active",
    joined: "2024-09-10",
  },
  {
    id: 4,
    name: "Emily Brown",
    email: "emily.brown@email.com",
    role: "Authority",
    vehicles: 0,
    status: "inactive",
    joined: "2024-07-05",
  },
]

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">System-wide monitoring and user management</p>
            </div>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </Button>
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-foreground">10,487</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-xs text-success">+3.2% this month</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Vehicles</p>
                  <p className="text-3xl font-bold text-foreground">11,245</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-xs text-success">+3.3% this month</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Car className="h-6 w-6 text-accent" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Data Points</p>
                  <p className="text-3xl font-bold text-foreground">156M</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-xs text-success">+4.8% this month</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <Database className="h-6 w-6 text-success" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">System Uptime</p>
                  <p className="text-3xl font-bold text-foreground">99.8%</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Activity className="h-4 w-4 text-success animate-pulse-soft" />
                    <span className="text-xs text-success">All systems operational</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-warning" />
                </div>
              </div>
            </Card>
          </div>

          {/* Growth Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-card border-border">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">Platform Growth</h3>
                <p className="text-sm text-muted-foreground">Users and vehicles over time</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={systemStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Users"
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="vehicles"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      name="Vehicles"
                      dot={{ fill: "hsl(var(--accent))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">Data Collection</h3>
                <p className="text-sm text-muted-foreground">Monthly sensor data points</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={systemStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="dataPoints" fill="hsl(var(--success))" name="Data Points" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* User Management */}
          <Card className="p-6 bg-card border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">User Management</h3>
                <p className="text-sm text-muted-foreground">Monitor and manage system users</p>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vehicles</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="bg-transparent">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{user.vehicles}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {user.status === "active" ? (
                          <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground border-border" variant="outline">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-foreground">{user.joined}</td>
                      <td className="py-4 px-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* System Status & Regional Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">System Health</h3>
                  <p className="text-sm text-muted-foreground">All services operational</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-success rounded-full animate-pulse-soft" />
                    <span className="text-sm font-medium text-foreground">API Services</span>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20">Operational</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-success rounded-full animate-pulse-soft" />
                    <span className="text-sm font-medium text-foreground">Database</span>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20">Operational</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-success rounded-full animate-pulse-soft" />
                    <span className="text-sm font-medium text-foreground">Sensor Network</span>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20">Operational</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-warning rounded-full animate-pulse-soft" />
                    <span className="text-sm font-medium text-foreground">Email Service</span>
                  </div>
                  <Badge className="bg-warning/10 text-warning border-warning/20">Degraded</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Regional Distribution</h3>
                  <p className="text-sm text-muted-foreground">Active users by region</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { region: "North America", users: 3842, percentage: 36.6 },
                  { region: "Europe", users: 2956, percentage: 28.2 },
                  { region: "Asia Pacific", users: 2234, percentage: 21.3 },
                  { region: "Latin America", users: 1455, percentage: 13.9 },
                ].map((item) => (
                  <div key={item.region}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{item.region}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.users.toLocaleString()} users ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Admin Quick Actions</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage system-wide settings, export data, and configure thresholds
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm">
                    Configure Thresholds
                  </Button>
                  <Button variant="outline" size="sm">
                    Export System Data
                  </Button>
                  <Button variant="outline" size="sm">
                    Generate Global Report
                  </Button>
                  <Button variant="outline" size="sm">
                    Manage Roles
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
