import { useMemo, useState } from "react"
import useSWR from "swr"
import { BentoCard } from "@/components/dashboard/BentoCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  Users,
  Monitor,
  Globe,
  Activity,
  Trophy,
  MapPin,
  Laptop,
  Target,
  Sparkles,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { globalAnalyticsApi, SWR_KEYS } from "@/lib/api"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { Link } from "react-router"

const DEVICE_COLORS = ["var(--primary)", "#10B981", "#F59E0B"]
const BROWSER_COLORS = ["#3B82F6", "#8B5CF6", "#F97316", "#06B6D4"]
const OS_COLORS = ["#EC4899", "#10B981", "#3B82F6", "#8B5CF6"]

const timeLabels = ["12am", "3am", "6am", "9am", "12pm", "3pm", "6pm", "9pm"]

export default function Analytics() {
  const [timeframe, setTimeframe] = useState("30d")

  const days = useMemo(() => {
    switch (timeframe) {
      case "7d":
        return 7
      case "30d":
        return 30
      case "90d":
        return 90
      case "1y":
        return 365
      default:
        return 30
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
    return [
      { name: "Mobile", value: mobile, color: DEVICE_COLORS[0] },
      { name: "Desktop", value: desktop, color: DEVICE_COLORS[1] },
      { name: "Tablet", value: tablet, color: DEVICE_COLORS[2] },
    ].filter((d) => d.value > 0)
  }, [audienceData?.device])

  const browserData = useMemo(() => {
    if (!audienceData?.browser) return []
    return audienceData.browser
      .filter((b) => b.value > 0)
      .map((b, i) => ({ ...b, color: BROWSER_COLORS[i % BROWSER_COLORS.length] }))
  }, [audienceData?.browser])

  const osData = useMemo(() => {
    if (!audienceData?.os) return []
    return audienceData.os
      .filter((o) => o.value > 0)
      .map((o, i) => ({ ...o, color: OS_COLORS[i % OS_COLORS.length] }))
  }, [audienceData?.os])

  const countryData = useMemo(() => audienceData?.geographic ?? [], [audienceData?.geographic])

  const totalResponses = useMemo(
    () => trendsData?.reduce((sum, point) => sum + point.responses, 0) ?? 0,
    [trendsData]
  )

  const averageCompletion = useMemo(() => {
    if (!trendsData || trendsData.length === 0) return 0
    const total = trendsData.reduce((sum, point) => sum + point.completionRate, 0)
    return Math.round(total / trendsData.length)
  }, [trendsData])

  const topCountry = countryData[0]
  const topBrowser = browserData[0]
  const topOs = osData[0]
  const topPoll = leaderboardData?.[0]
  const bestConversionPoll =
    leaderboardData && leaderboardData.length > 0
      ? leaderboardData.reduce((best, poll) => (poll.rate > best.rate ? poll : best), leaderboardData[0])
      : undefined

  const heatmapMax = useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) return 0
    return Math.max(...heatmapData.flatMap((row) => row.hours))
  }, [heatmapData])


  const isLoading = trendsLoading || audienceLoading || leaderboardLoading || heatmapLoading

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient Background Orbs */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_28%)]" />
      <div className="pointer-events-none absolute -top-24 right-[-4rem] h-96 w-96 rounded-full bg-primary/10 blur-[120px] mix-blend-screen animate-pulse" />
      <div className="pointer-events-none absolute top-1/3 left-[-5rem] h-80 w-80 rounded-full bg-emerald-500/5 blur-[100px] mix-blend-screen" />

      <div className="container mx-auto space-y-8 px-4 py-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">System Overview</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">Global Analytics</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium text-muted-foreground md:text-base leading-relaxed">
                Account-wide insight, laid out as one bento canvas for response volume, audience shape, and top polls.
              </p>
            </div>
          </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
              <span className={cn("h-1.5 w-1.5 rounded-full bg-primary", isLoading ? "animate-spin" : "animate-pulse")} />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                {isLoading ? "Syncing..." : "Live System Data"}
              </span>
            </div>
            <Select value={timeframe} onValueChange={(val) => setTimeframe(val as string)}>
              <SelectTrigger className="w-[160px] font-bold bg-background/40 backdrop-blur-xl border-white/10 rounded-xl">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-white/10">
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 lg:grid-cols-12 auto-rows-fr"
        >
          {/* Main Trends Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-8 h-full">
            <BentoCard variant="gradient" className="h-full p-8 flex flex-col gap-6 group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                <TrendingUp className="h-64 w-64" />
              </div>

              <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Response Volume
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground mt-1">Total traffic across all active campaign surfaces</p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/5 bg-background/40 p-4 backdrop-blur-sm">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Responses</p>
                    <p className="mt-1 text-2xl font-black tracking-tight">{totalResponses.toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-background/40 p-4 backdrop-blur-sm">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Completion</p>
                    <p className="mt-1 text-2xl font-black tracking-tight">{averageCompletion}%</p>
                  </div>
                  <div className="hidden rounded-2xl border border-white/5 bg-background/40 p-4 backdrop-blur-sm sm:block">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Interval</p>
                    <p className="mt-1 text-2xl font-black tracking-tight">{days}d</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-h-[300px] w-full relative z-10">
                {trendsLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                  </div>
                ) : trendsData && trendsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.05} />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fontWeight: 600, fill: "currentColor", opacity: 0.4 }}
                        dy={10}
                        minTickGap={40}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fontWeight: 600, fill: "currentColor", opacity: 0.4 }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 15, 15, 0.8)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                          boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                        }}
                        itemStyle={{ color: "#fff", fontWeight: "bold" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="responses"
                        stroke="var(--primary)"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorResponses)"
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground font-medium italic">No signal data available</div>
                )}
              </div>
            </BentoCard>
          </motion.div>

          {/* Audience Snapshot */}
          <motion.div variants={itemVariants} className="lg:col-span-4 h-full">
            <BentoCard className="h-full p-8 flex flex-col gap-6 border-white/5 bg-background/30 backdrop-blur-xl">
              <div>
                <h3 className="text-xl font-black flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  Audience Signal
                </h3>
                <p className="text-sm font-medium text-muted-foreground mt-1">Live snapshot of respondent characteristics</p>
              </div>

              <div className="grid gap-4">
                {[
                  { label: "Top Country", value: topCountry?.country, sub: `${topCountry?.users.toLocaleString()} users`, pct: topCountry?.percentage, icon: MapPin, color: "text-primary" },
                  { label: "Main Browser", value: topBrowser?.name, sub: "Audience share", pct: topBrowser?.value, icon: Globe, color: "text-sky-500" },
                  { label: "Dominant OS", value: topOs?.name, sub: "Operating share", pct: topOs?.value, icon: Laptop, color: "text-pink-500" },
                ].map((item, i) => (
                  <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-5 hover:bg-white/10 transition-colors">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <item.icon className={cn("h-3 w-3", item.color)} />
                      {item.label}
                    </p>
                    {item.value ? (
                      <div className="mt-3 flex items-start justify-between">
                        <div>
                          <p className="text-lg font-black tracking-tight">{item.value}</p>
                          <p className="text-xs font-medium text-muted-foreground">{item.sub}</p>
                        </div>
                        <Badge variant="outline" className="bg-white/5 border-white/10 font-black">{item.pct}%</Badge>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs font-medium text-muted-foreground italic">Collecting data...</p>
                    )}
                  </div>
                ))}

                <div className="rounded-2xl border border-white/5 bg-primary/10 p-5 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Pulse</p>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">
                    {isLoading
                      ? "Refreshing global feeds. Signal processing in progress."
                      : "Signal is strong. Use timeframe to shift trend surface."}
                  </p>
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* Heatmap */}
          <motion.div variants={itemVariants} className="lg:col-span-7 h-full">
            <BentoCard className="h-full p-8 flex flex-col justify-between group border-white/5 bg-background/30 backdrop-blur-xl">
              <div className="absolute right-0 bottom-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Activity className="h-64 w-64" />
              </div>

              <div className="relative z-10">
                <h3 className="text-xl font-black flex items-center gap-3">
                  <Activity className="h-6 w-6 text-emerald-500" />
                  Peak Intensity
                </h3>
                <p className="text-sm font-medium text-muted-foreground mt-1">Global response density by day and hour</p>
              </div>

              {heatmapLoading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500 opacity-20" />
                </div>
              ) : heatmapData && heatmapData.length > 0 ? (
                <div className="relative z-10 mt-8 flex flex-col gap-2.5">
                  <div className="mb-2 flex justify-between pl-10 text-xs font-black uppercase tracking-widest text-muted-foreground opacity-50">
                    {timeLabels.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                  {heatmapData.map((row) => (
                    <div key={row.day} className="flex items-center gap-3">
                      <span className="w-8 text-[11px] font-black uppercase tracking-tighter text-muted-foreground">{row.day.slice(0, 3)}</span>
                      <div className="flex h-9 flex-1 gap-1.5">
                        {row.hours.map((val, i) => (
                          <div
                            key={i}
                            className="flex-1 cursor-pointer rounded-md transition-all hover:scale-110 hover:z-20 shadow-sm"
                            style={{
                              backgroundColor: `rgba(16, 185, 129, ${heatmapMax > 0 ? Math.max(0.08, (val / heatmapMax)) : 0.08
                                })`,
                              boxShadow: val > 0 ? `0 0 15px rgba(16, 185, 129, ${(val / heatmapMax) * 0.3})` : 'none'
                            }}
                            title={`${val} responses`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center text-muted-foreground italic">Waiting for signal...</div>
              )}
            </BentoCard>
          </motion.div>

          {/* Geo Distribution */}
          <motion.div variants={itemVariants} className="lg:col-span-5 h-full">
            <BentoCard className="h-full p-8 flex flex-col group border-white/5 bg-background/30 backdrop-blur-xl">
              <div className="absolute right-0 bottom-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-1000">
                <Globe className="h-64 w-64" />
              </div>

              <div className="relative z-10 mb-8">
                <h3 className="text-xl font-black flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-indigo-500" />
                  Geographic Map
                </h3>
                <p className="text-sm font-medium text-muted-foreground mt-1">High-level location signals from respondents</p>
              </div>

              <div className="relative z-10 flex-1 space-y-5">
                {countryData.length > 0 ? (
                  countryData.slice(0, 5).map((country) => (
                    <div key={country.code} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-black tracking-tight">{country.country}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-[11px] font-bold text-muted-foreground">{country.users.toLocaleString()} users</span>
                          <span className="w-10 text-right font-black text-indigo-500">{country.percentage}%</span>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${country.percentage}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground opacity-40 py-10">
                    <Globe className="mb-4 h-12 w-12 animate-pulse" />
                    <p className="text-sm font-black uppercase tracking-widest">No Geo Data</p>
                  </div>
                )}
              </div>
            </BentoCard>
          </motion.div>

          {/* Device Pie Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-4 h-full">
            <BentoCard className="h-full p-8 flex flex-col md:flex-row items-center gap-8 border-white/5 bg-background/30 backdrop-blur-xl group">
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-black flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-primary" />
                  Devices
                </h3>
                <div className="flex flex-col gap-3.5">
                  {deviceData.length > 0 ? (
                    deviceData.map((device) => (
                      <div key={device.name} className="flex items-center justify-between group/item">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: device.color, backgroundColor: device.color }} />
                          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover/item:text-foreground transition-colors">{device.name}</span>
                        </div>
                        <span className="text-sm font-black">{device.value}%</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs font-medium text-muted-foreground italic">No signal yet</p>
                  )}
                </div>
              </div>
              {deviceData.length > 0 && (
                <div className="h-[160px] w-[160px] shrink-0 relative">
                  <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl animate-pulse" />
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </BentoCard>
          </motion.div>

          {/* Browsers & OS */}
          <motion.div variants={itemVariants} className="lg:col-span-4 h-full">
            <BentoCard className="h-full p-8 flex flex-col justify-between border-white/5 bg-background/30 backdrop-blur-xl group">
              <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-110 transition-transform">
                <Globe className="h-32 w-32" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-6">Top Browsers</h3>
              <div className="relative z-10 space-y-4">
                {browserData.length > 0 ? (
                  browserData.slice(0, 4).map((browser) => (
                    <div key={browser.name} className="flex items-center justify-between">
                      <span className="text-sm font-black tracking-tight">{browser.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="h-1 flex-1 w-20 rounded-full bg-white/5">
                          <div className="h-full rounded-full" style={{ width: `${browser.value}%`, backgroundColor: browser.color }} />
                        </div>
                        <span className="text-sm font-black w-8 text-right" style={{ color: browser.color }}>{browser.value}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-medium text-muted-foreground">Waiting for data...</p>
                )}
              </div>
            </BentoCard>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-4 h-full">
            <BentoCard className="h-full p-8 flex flex-col justify-between border-white/5 bg-background/30 backdrop-blur-xl group">
              <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-110 transition-transform">
                <Laptop className="h-32 w-32" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-6">Systems</h3>
              <div className="relative z-10 space-y-4">
                {osData.length > 0 ? (
                  osData.slice(0, 4).map((os) => (
                    <div key={os.name} className="flex items-center justify-between">
                      <span className="text-sm font-black tracking-tight">{os.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="h-1 flex-1 w-20 rounded-full bg-white/5">
                          <div className="h-full rounded-full" style={{ width: `${os.value}%`, backgroundColor: os.color }} />
                        </div>
                        <span className="text-sm font-black w-8 text-right" style={{ color: os.color }}>{os.value}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-medium text-muted-foreground">Waiting for data...</p>
                )}
              </div>
            </BentoCard>
          </motion.div>

          {/* Leaderboard */}
          <motion.div variants={itemVariants} className="lg:col-span-8 h-full">
            <BentoCard className="h-full p-8 border-white/5 bg-background/30 backdrop-blur-xl">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-amber-500" />
                    Top Performance
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground mt-1">High-volume campaigns ranked by total engagement</p>
                </div>
                {bestConversionPoll && (
                  <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    Peak Conversion: {bestConversionPoll.rate}%
                  </div>
                )}
              </div>

              {leaderboardLoading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500 opacity-20" />
                </div>
              ) : leaderboardData && leaderboardData.length > 0 ? (
                <div className="space-y-4">
                  {leaderboardData.slice(0, 4).map((poll, index) => (
                    <Link
                      key={poll.id}
                      to={`/polls/${poll.id}/analytics`}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-primary/30 hover:scale-[1.01] group/poll"
                    >
                      <div className="flex items-center gap-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-lg font-black text-amber-500 group-hover/poll:bg-amber-500 group-hover/poll:text-white transition-colors">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="line-clamp-1 font-black text-lg tracking-tight group-hover/poll:text-primary transition-colors">{poll.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className="bg-white/5 border-white/10 font-bold text-xs">{poll.rate}% completion</Badge>
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                              <ChevronRight className="h-3 w-3" /> View Detail
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-2xl font-black tracking-tight">{poll.responses.toLocaleString()}</p>
                        <p
                          className={cn(
                            "text-xs font-black uppercase tracking-widest",
                            poll.trend.startsWith("+") ? "text-emerald-500" : poll.trend.startsWith("-") ? "text-red-500" : "text-muted-foreground"
                          )}
                        >
                          {poll.trend} Trend
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex h-48 flex-col items-center justify-center text-muted-foreground py-20">
                  <Trophy className="mb-4 h-12 w-12 opacity-10" />
                  <p className="font-black uppercase tracking-[0.2em] opacity-30">No Performance Data</p>
                </div>
              )}
            </BentoCard>
          </motion.div>

          {/* Conversion Focus Card */}
          <motion.div variants={itemVariants} className="lg:col-span-4 h-full">
            <BentoCard variant="gradient" className="h-full p-8 flex flex-col justify-between group overflow-hidden">
              <div className="absolute right-[-10%] bottom-[-10%] p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000 rotate-12">
                <Target className="h-64 w-64 text-primary" />
              </div>

              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-full bg-primary/20 p-2">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Focus Insight</span>
                </div>
                <h3 className="text-3xl font-black leading-tight tracking-tighter">
                  {topPoll ? topPoll.title : "Ready for signal"}
                </h3>
                <p className="mt-4 text-sm font-medium text-muted-foreground leading-relaxed">
                  {topPoll
                    ? "Current account champion. This campaign shows the highest viral potential and response density."
                    : "Leaderboard insight will appear here once your polls start capturing response signals."}
                </p>
              </div>

              <div className="relative z-10 grid gap-4 mt-8">
                <div className="rounded-2xl border border-white/10 bg-background/40 p-5 backdrop-blur-md">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Top Volume</p>
                  <p className="mt-1 text-2xl font-black tracking-tight">{topPoll ? topPoll.responses.toLocaleString() : "0"} Signal Hits</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-background/40 p-5 backdrop-blur-md">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Retention</p>
                  <p className="mt-1 text-2xl font-black tracking-tight">{bestConversionPoll ? `${bestConversionPoll.rate}%` : "0%"} Completion</p>
                </div>
              </div>
            </BentoCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
