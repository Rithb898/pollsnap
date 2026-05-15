import { useState, useMemo } from "react"
import useSWR from "swr"
import { BentoCard } from "@/components/dashboard/BentoCard"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, TrendingUp, Users, Monitor, Globe, Activity, Trophy, MapPin, Laptop, Target } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, } from "recharts"
import { toast } from "sonner"
import { globalAnalyticsApi, SWR_KEYS } from "@/lib/api"

const DEVICE_COLORS = ['#4F46E5', '#10B981', '#F59E0B']
const BROWSER_COLORS = ['#3B82F6', '#8B5CF6', '#F97316', '#06B6D4']
const OS_COLORS = ['#EC4899', '#10B981', '#3B82F6', '#8B5CF6']

const timeLabels = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm']

export default function Analytics() {
  const [timeframe, setTimeframe] = useState("30d")

  const days = useMemo(() => {
    switch (timeframe) {
      case "7d": return 7
      case "30d": return 30
      case "90d": return 90
      case "1y": return 365
      default: return 30
    }
  }, [timeframe])

  const { data: trendsData, isLoading: trendsLoading } = useSWR(
    SWR_KEYS.globalAnalyticsTrends(days),
    () => globalAnalyticsApi.getTrends(days)
  )

  const { data: audienceData, isLoading: audienceLoading } = useSWR(
    SWR_KEYS.globalAnalyticsAudience(),
    () => globalAnalyticsApi.getAudienceData()
  )

  const { data: leaderboardData, isLoading: leaderboardLoading } = useSWR(
    SWR_KEYS.globalAnalyticsLeaderboard(),
    () => globalAnalyticsApi.getLeaderboard()
  )

  const { data: heatmapData, isLoading: heatmapLoading } = useSWR(
    SWR_KEYS.globalAnalyticsHeatmap(),
    () => globalAnalyticsApi.getHeatmap()
  )

  const deviceData = useMemo(() => {
    if (!audienceData?.device) return []
    const { mobile, desktop, tablet } = audienceData.device
    const total = mobile + desktop + tablet
    if (total === 0) return []
    return [
      { name: 'Mobile', value: mobile, color: DEVICE_COLORS[0] },
      { name: 'Desktop', value: desktop, color: DEVICE_COLORS[1] },
      { name: 'Tablet', value: tablet, color: DEVICE_COLORS[2] },
    ].filter(d => d.value > 0)
  }, [audienceData?.device])

  const browserData = useMemo(() => {
    if (!audienceData?.browser) return []
    return audienceData.browser
      .filter(b => b.value > 0)
      .map((b, i) => ({ ...b, color: BROWSER_COLORS[i % BROWSER_COLORS.length] }))
  }, [audienceData?.browser])

  const osData = useMemo(() => {
    if (!audienceData?.os) return []
    return audienceData.os
      .filter(o => o.value > 0)
      .map((o, i) => ({ ...o, color: OS_COLORS[i % OS_COLORS.length] }))
  }, [audienceData?.os])

  const countryData = useMemo(() => {
    if (!audienceData?.geographic || audienceData.geographic.length === 0) {
      return []
    }
    return audienceData.geographic
  }, [audienceData?.geographic])

  const handleExport = () => {
    toast.success("Generating report...", {
      description: "Your CSV export will begin downloading shortly."
    })
  }

  const isLoading = trendsLoading || audienceLoading || leaderboardLoading || heatmapLoading

  return (
    <div className="container space-y-8 mx-auto px-4">
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

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <BentoCard variant="gradient" className="md:col-span-3 p-6 min-h-[400px] flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Response Volume ({timeframe})
                </h3>
                <p className="text-sm text-muted-foreground">Total responses collected across all your polls</p>
              </div>
              <div className="flex-1 w-full min-h-[300px]">
                {trendsLoading ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
                ) : trendsData && trendsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
                )}
              </div>
            </BentoCard>

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
              
              {heatmapLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
              ) : heatmapData && heatmapData.length > 0 ? (
                <div className="flex flex-col gap-2 relative z-10">
                  <div className="flex pl-8 justify-between text-xs font-bold text-muted-foreground mb-1">
                    {timeLabels.map(t => <span key={t}>{t}</span>)}
                  </div>
                  {heatmapData.map((row) => (
                    <div key={row.day} className="flex items-center gap-2">
                      <span className="w-8 text-xs font-bold text-muted-foreground">{row.day}</span>
                      <div className="flex-1 flex gap-1 h-8">
                        {row.hours.map((val, i) => {
                          const maxVal = Math.max(...heatmapData.flatMap(r => r.hours))
                          return (
                            <div 
                              key={i} 
                              className="flex-1 rounded-sm transition-all hover:scale-110 cursor-pointer"
                              style={{ backgroundColor: `rgba(16, 185, 129, ${maxVal > 0 ? Math.max(0.1, val / maxVal) : 0.1})` }}
                              title={`${val} responses`}
                            />
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
              )}
            </BentoCard>

            <BentoCard className="md:col-span-1 p-6 min-h-[300px] flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-500" />
                  Avg Completion
                </h3>
                <p className="text-xs text-muted-foreground">Trend of users finishing polls</p>
              </div>
              <div className="flex-1 w-full min-h-[150px]">
                {trendsLoading ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
                ) : trendsData && trendsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendsData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
                )}
              </div>
            </BentoCard>

          </div>
        </TabsContent>

        <TabsContent value="audience" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
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
                {countryData.length > 0 ? countryData.map((country) => (
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
                )) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-70">
                    <Globe className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm font-medium">No geographic data yet</p>
                    <p className="text-xs">Country data will appear as responses come in</p>
                  </div>
                )}
              </div>
            </BentoCard>

            <BentoCard className="md:col-span-2 p-6 min-h-[200px] flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  Device Breakdown
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Mobile vs Desktop usage</p>
                <div className="flex flex-col gap-3">
                  {deviceData.length > 0 ? deviceData.map(d => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-sm font-medium">{d.name}</span>
                      </div>
                      <span className="font-bold text-sm">{d.value}%</span>
                    </div>
                  )) : (
                    <div className="text-sm text-muted-foreground">No device data available</div>
                  )}
                </div>
              </div>
              {deviceData.length > 0 && (
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
              )}
            </BentoCard>

            <BentoCard className="md:col-span-1 p-6 min-h-[200px] flex flex-col justify-between group">
               <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Globe className="w-32 h-32" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Browsers</h3>
                <div className="space-y-3 relative z-10">
                  {browserData.length > 0 ? browserData.map(b => (
                    <div key={b.name} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{b.name}</span>
                      <span className="font-bold" style={{ color: b.color }}>{b.value}%</span>
                    </div>
                  )) : (
                    <div className="text-sm text-muted-foreground">No browser data</div>
                  )}
                </div>
              </div>
            </BentoCard>

            <BentoCard className="md:col-span-1 p-6 min-h-[200px] flex flex-col justify-between group">
              <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Laptop className="w-32 h-32" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Systems</h3>
                <div className="space-y-3 relative z-10">
                  {osData.length > 0 ? osData.map(os => (
                    <div key={os.name} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{os.name}</span>
                      <span className="font-bold" style={{ color: os.color }}>{os.value}%</span>
                    </div>
                  )) : (
                    <div className="text-sm text-muted-foreground">No OS data</div>
                  )}
                </div>
              </div>
            </BentoCard>

          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <BentoCard className="md:col-span-2 md:row-span-2 p-6 min-h-[400px]">
              <div className="mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Top Performing Polls
                </h3>
                <p className="text-sm text-muted-foreground">Your most successful campaigns ranked by volume</p>
              </div>
              
              {leaderboardLoading ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground">Loading...</div>
              ) : leaderboardData && leaderboardData.length > 0 ? (
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
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <Trophy className="h-12 w-12 mb-4 opacity-50" />
                  <p>No active polls with responses yet</p>
                  <p className="text-sm">Activate a poll to start collecting responses</p>
                </div>
              )}
            </BentoCard>

            {leaderboardData && leaderboardData.length > 0 && (
              <>
                <BentoCard variant="gradient" className="md:col-span-1 p-6 flex flex-col justify-center items-center text-center group">
                  <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Most Viral</p>
                  <h3 className="text-2xl font-black mb-1 line-clamp-1">{leaderboardData[0].title}</h3>
                  <p className="text-sm text-primary font-bold">{leaderboardData[0].responses.toLocaleString()} Responses</p>
                </BentoCard>

                <BentoCard className="md:col-span-1 p-6 flex flex-col justify-center items-center text-center group border-emerald-500/20 bg-emerald-500/5">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Target className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Highest Conversion</p>
                  <h3 className="text-2xl font-black mb-1 line-clamp-1">
                    {leaderboardData.reduce((best, poll) => poll.rate > best.rate ? poll : best, leaderboardData[0]).title}
                  </h3>
                  <p className="text-sm text-emerald-500 font-bold">
                    {Math.max(...leaderboardData.map(p => p.rate))}% Completion Rate
                  </p>
                </BentoCard>
              </>
            )}

          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
