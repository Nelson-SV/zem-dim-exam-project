import { TrendingUp, TrendingDown, DollarSign, Clock, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockProjects } from '../lib/mock-data';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-primary/10">
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
          trend === 'up' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'
        }`}>
          {trend === 'up' ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
          {change}
        </div>
      </div>
      <p className="text-muted-foreground mb-1">{title}</p>
      <h2>{value}</h2>
    </Card>
  );
}

export function AdminAnalytics() {
  // Mock data for charts
  const monthlyRevenue = [
    { month: 'Aug', revenue: 450000, projects: 2 },
    { month: 'Sep', revenue: 520000, projects: 3 },
    { month: 'Oct', revenue: 680000, projects: 4 },
    { month: 'Nov', revenue: 750000, projects: 5 },
    { month: 'Dec', revenue: 890000, projects: 6 },
    { month: 'Jan', revenue: 920000, projects: 5 },
  ];

  const projectsByStage = [
    { name: 'Foundation', value: 2, color: '#F97316' },
    { name: 'Walls', value: 3, color: '#3B82F6' },
    { name: 'Roof', value: 1, color: '#10B981' },
    { name: 'Finishing', value: 2, color: '#F59E0B' },
  ];

  const progressData = mockProjects.map(p => ({
    name: p.name.split(' ')[0],
    progress: p.progress,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="mb-2">Analytics and reports</h2>
          <p className="text-muted-foreground">
            Overview of financial metrics and project progress
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="month">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export report</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total revenue"
          value="₴4.2M"
          change="+12.5%"
          trend="up"
          icon={<DollarSign className="size-6 text-[#F97316]" />}
        />
        <StatCard
          title="Active projects"
          value={mockProjects.filter(p => p.status === 'active').length.toString()}
          change="+8.3%"
          trend="up"
          icon={<Activity className="size-6 text-[#3B82F6]" />}
        />
        <StatCard
          title="Average delivery time"
          value="142 days"
          change="-5.2%"
          trend="up"
          icon={<Clock className="size-6 text-[#10B981]" />}
        />
        <StatCard
          title="Client satisfaction"
          value="94%"
          change="+2.1%"
          trend="up"
          icon={<TrendingUp className="size-6 text-[#F59E0B]" />}
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="stages">Stages</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-6">Monthly revenue</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#F97316" name="Revenue (₴)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-6">Project progress</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Progress (%)"
                  dot={{ fill: '#3B82F6', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="stages" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="mb-6">Distribution by stage</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectsByStage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectsByStage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="mb-6">Stage details</h3>
              <div className="space-y-4">
                {projectsByStage.map((stage, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: `${stage.color}15` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span>{stage.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{stage.value} projects</span>
                      <span>{((stage.value / projectsByStage.reduce((acc, s) => acc + s.value, 0)) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h4 className="mb-4">Fastest project</h4>
          <p className="text-muted-foreground mb-2">Cottage in Vyshneve</p>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-[#10B981]" />
            <span>120 days</span>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="mb-4">Largest project</h4>
          <p className="text-muted-foreground mb-2">House in Bucha</p>
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-[#3B82F6]" />
            <span>220 m²</span>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="mb-4">Most profitable</h4>
          <p className="text-muted-foreground mb-2">Cottage in Vyshneve</p>
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 text-[#F97316]" />
            <span>₴1.2M</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
