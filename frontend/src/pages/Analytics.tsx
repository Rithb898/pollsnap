import { useState } from "react"
import { BentoCard } from "@/components/dashboard/BentoCard"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, TrendingUp, Users, Monitor, Globe, Activity, Trophy, MapPin, Laptop, Smartphone, Target } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, } from "recharts"
import { toast } from "sonner"

// --- Mock Data ---
const longTermTrends = Array.from({ length: 30 }).map((_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  responses: Math.floor(Math.random() * 500) + 100,
  completionRate: Math.floor(Math.random() * 20) + 70,
}))

const deviceData = [
  { name: 'Mobile', value: 65, color: '#4F46E5' },
  { name: 'Desktop', value: 30, color: '#10B981' },
  { name: 'Tablet', value: 5, color: '#F59E0B' },
]

const browserData = [
  { name: 'Chrome', value: 60, color: '#3B82F6' },
  { name: 'Safari', value: 25, color: '#8B5CF6' },
  { name: 'Firefox', value: 10, color: '#F97316' },
  { name: 'Edge', value: 5, color: '#06B6D4' },
]

const osData = [
  { name: 'iOS', value: 45, color: '#EC4899' },
  { name: 'Android', value: 25, color: '#10B981' },
  { name: 'Windows', value: 20, color: '#3B82F6' },
  { name: 'macOS', value: 10, color: '#8B5CF6' },
]

const countryData = [
  { country: "United States", code: "US", users: 12450, percentage: 45 },
  { country: "United Kingdom", code: "GB", users: 4820, percentage: 18 },
  { country: "Canada", code: "CA", users: 3200, percentage: 12 },
  { country: "Australia", code: "AU", users: 2100, percentage: 8 },
  { country: "Germany", code: "DE", users: 1500, percentage: 5 },
]

const leaderboardData = [
  { id: 1, title: "Q3 Product Feedback", responses: 1240, rate: 94, trend: "+12%" },
  { id: 2, title: "Feature Prioritization", responses: 856, rate: 88, trend: "+5%" },
  { id: 3, title: "Customer Satisfaction Survey", responses: 632, rate: 76, trend: "-2%" },
  { id: 4, title: "Remote Work Preferences", responses: 412, rate: 91, trend: "+8%" },
  { id: 5, title: "Website Redesign Opinions", responses: 389, rate: 65, trend: "0%" },
]

const heatmapData = [
  { day: 'Mon', hours: [10, 20, 45, 80, 120, 90, 40, 15] },
  { day: 'Tue', hours: [12, 25, 50, 95, 140, 85, 35, 10] },
  { day: 'Wed', hours: [15, 30, 60, 110, 160, 100, 45, 20] },
  { day: 'Thu', hours: [10, 28, 55, 105, 150, 95, 40, 18] },
  { day: 'Fri', hours: [8, 20, 40, 70, 100, 60, 30, 12] },
  { day: 'Sat', hours: [5, 10, 20, 40, 60, 45, 25, 8] },
  { day: 'Sun', hours: [5, 12, 25, 45, 65, 50, 20, 10] },
]
const timeLabels = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm']

export default function Analytics() {
  const [timeframe, setTimeframe] = useState("30d")

  const handleExport = () => {
    toast.success("Generating report...", {
      description: "Your CSV export will begin downloading shortly."
    })
  }

  return (
    <div className="container space-y-8 mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            Global Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Account-wide insights and historical data.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[140px] font-medium">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} className="font-heading uppercase tracking-wider font-bold">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB - BENTO GRID */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Massive Area Chart spanning 3 columns */}
            <BentoCard variant="gradient" className="md:col-span-3 p-6 min-h-[400px] flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Response Volume ({timeframe})
                </h3>
                <p className="text-sm text-muted-foreground">Total responses collected across all your polls</p>
              </div>
              <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={longTermTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} dy={10} minTickGap={30} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area type="monotone" dataKey="responses" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorResponses)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </BentoCard>

            {/* Heatmap spanning 2 columns */}
            <BentoCard className="md:col-span-2 p-6 min-h-[300px] flex flex-col justify-between group">
              <div className="absolute right-[-5%] bottom-[-10%] opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Activity className="w-64 h-64" />
              </div>
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  Peak Activity Heatmap
                </h3>
                <p className="text-sm text-muted-foreground mb-6">When your audience is most likely to vote</p>
              </div>
              
              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex pl-8 justify-between text-xs font-bold text-muted-foreground mb-1">
                  {timeLabels.map(t => <span key={t}>{t}</span>)}
                </div>
                {heatmapData.map((row) => (
                  <div key={row.day} className="flex items-center gap-2">
                    <span className="w-8 text-xs font-bold text-muted-foreground">{row.day}</span>
                    <div className="flex-1 flex gap-1 h-8">
                      {row.hours.map((val, i) => (
                        <div 
                          key={i} 
                          className="flex-1 rounded-sm transition-all hover:scale-110 cursor-pointer"
                          style={{ backgroundColor: `rgba(16, 185, 129, ${Math.max(0.1, val / 160)})` }}
                          title={`${val} responses`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Completion Rate spanning 1 column */}
            <BentoCard className="md:col-span-1 p-6 min-h-[300px] flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-500" />
                  Avg Completion
                </h3>
                <p className="text-xs text-muted-foreground">Trend of users finishing polls</p>
              </div>
              <div className="flex-1 w-full min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={longTermTrends} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="completionRate" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </BentoCard>

          </div>
        </TabsContent>

        {/* AUDIENCE TAB - BENTO GRID */}
        <TabsContent value="audience" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Geographic Distribution (Large Square) */}
            <BentoCard className="md:col-span-2 md:row-span-2 p-6 min-h-[400px] flex flex-col group">
              <div className="absolute right-[5%] bottom-[5%] opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700">
                <Globe className="w-64 h-64" />
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-500" />
                  Geographic Distribution
                </h3>
                <p className="text-sm text-muted-foreground">Where your respondents are located globally</p>
              </div>
              
              <div className="flex-1 flex flex-col justify-center space-y-6 relative z-10">
                {countryData.map((country) => (
                  <div key={country.code} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{country.country}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{country.users.toLocaleString()} users</span>
                        <span className="font-bold w-12 text-right">{country.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${country.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Device Breakdown */}
            <BentoCard className="md:col-span-2 p-6 min-h-[200px] flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  Device Breakdown
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Mobile vs Desktop usage</p>
                <div className="flex flex-col gap-3">
                  {deviceData.map(d => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-sm font-medium">{d.name}</span>
                      </div>
                      <span className="font-bold text-sm">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-[150px] w-[150px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                      {deviceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '8px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </BentoCard>

            {/* Top Browsers */}
            <BentoCard className="md:col-span-1 p-6 min-h-[200px] flex flex-col justify-between group">
               <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Globe className="w-32 h-32" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Browsers</h3>
                <div className="space-y-3 relative z-10">
                  {browserData.map(b => (
                    <div key={b.name} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{b.name}</span>
                      <span className="font-bold" style={{ color: b.color }}>{b.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>

            {/* Operating Systems */}
            <BentoCard className="md:col-span-1 p-6 min-h-[200px] flex flex-col justify-between group">
              <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Laptop className="w-32 h-32" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Systems</h3>
                <div className="space-y-3 relative z-10">
                  {osData.map(os => (
                    <div key={os.name} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{os.name}</span>
                      <span className="font-bold" style={{ color: os.color }}>{os.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>

          </div>
        </TabsContent>

        {/* LEADERBOARD TAB - BENTO GRID */}
        <TabsContent value="leaderboard" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Top 5 List (Spanning 2 columns) */}
            <BentoCard className="md:col-span-2 md:row-span-2 p-6 min-h-[400px]">
              <div className="mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Top Performing Polls
                </h3>
                <p className="text-sm text-muted-foreground">Your most successful campaigns ranked by volume</p>
              </div>
              
              <div className="space-y-3">
                {leaderboardData.map((poll, index) => (
                  <div key={poll.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/40 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-sm border border-amber-500/20">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm md:text-base line-clamp-1">{poll.title}</h4>
                        <p className="text-xs text-muted-foreground">Completion Rate: {poll.rate}%</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-lg">{poll.responses.toLocaleString()}</p>
                      <p className={`text-xs font-bold ${poll.trend.startsWith('+') ? 'text-emerald-500' : poll.trend.startsWith('-') ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {poll.trend} this week
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Spotlight: Highest Volume */}
            <BentoCard variant="gradient" className="md:col-span-1 p-6 flex flex-col justify-center items-center text-center group">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Most Viral</p>
              <h3 className="text-2xl font-black mb-1 line-clamp-1">{leaderboardData[0].title}</h3>
              <p className="text-sm text-primary font-bold">{leaderboardData[0].responses.toLocaleString()} Responses</p>
            </BentoCard>

            {/* Spotlight: Best Completion Rate */}
            <BentoCard className="md:col-span-1 p-6 flex flex-col justify-center items-center text-center group border-emerald-500/20 bg-emerald-500/5">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Highest Conversion</p>
              <h3 className="text-2xl font-black mb-1 line-clamp-1">Q3 Product Feedback</h3>
              <p className="text-sm text-emerald-500 font-bold">94% Completion Rate</p>
            </BentoCard>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
