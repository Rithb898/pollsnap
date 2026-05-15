import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router"
import {
  Activity,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Eye,
  Globe,
  Laptop,
  MapPin,
  Monitor,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  WifiOff,
  Zap,
} from "lucide-react"
import useSWR from "swr"
import { formatDistanceToNow } from "date-fns"
import { motion, AnimatePresence } from "motion/react"
import {
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
} from "recharts"
import { toast } from "sonner"

import { ConnectionStatus } from "@/components/ConnectionStatus"
import { BentoCard } from "@/components/dashboard/BentoCard"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analyticsApi, SWR_KEYS, type PollAnalyticsDTO } from "@/lib/api"
import { useSocket } from "@/hooks/use-socket"
import { cn } from "@/lib/utils"

const CHART_COLORS = ["var(--primary)", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]
const DEVICE_COLORS = ["var(--primary)", "#10B981", "#F59E0B"]

export default function PollAnalytics() {
  const { pollId } = useParams()
  const [activeTab, setActiveTab] = useState("overview")
  const { isConnected, on } = useSocket("/creator", pollId || "")

  const { data: pollData, isLoading, mutate } = useSWR(
    pollId ? SWR_KEYS.pollAnalytics(pollId) : null,
    () => analyticsApi.getPollAnalytics(pollId!)
  )

  useEffect(() => {
    if (!pollId) return

    const unsubResponseNew = on<{ pollId: string }>("response:new", (data) => {
      if (data.pollId === pollId) mutate()
    })

    const unsubVoteUpdate = on<{ pollId: string }>("vote:update", (data) => {
      if (data.pollId === pollId) mutate()
    })

    const unsubPollClosed = on<{ pollId: string }>("poll:closed", () => {
      mutate()
    })

    return () => {
      unsubResponseNew()
      unsubVoteUpdate()
      unsubPollClosed()
    }
  }, [mutate, on, pollId])

  const allOptions = useMemo(
    () => pollData?.questions.flatMap((question) => question.options) ?? [],
    [pollData]
  )

  const topOption = useMemo(
    () =>
      allOptions.reduce<
        PollAnalyticsDTO["questions"][number]["options"][number] | null
      >((best, option) => {
        if (!best || option.count > best.count) return option
        return best
      }, null),
    [allOptions]
  )

  const latestResponse = pollData?.recentVotes[0]
    ? new Date(pollData.recentVotes[0].time)
    : null
  const freshnessLabel = latestResponse
    ? formatDistanceToNow(latestResponse, { addSuffix: true })
    : "No responses yet"

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

  if (isLoading || !pollData) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-t-2 border-primary animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">
            Synchronizing Analytics
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient Background Orbs */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.1),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.06),transparent_30%)]" />
      <div className="pointer-events-none absolute -top-24 -right-16 h-96 w-96 rounded-full bg-primary/10 blur-[120px] mix-blend-screen animate-pulse" />
      <div className="pointer-events-none absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-emerald-500/5 blur-[100px] mix-blend-screen" />

      <div className="container mx-auto space-y-8 px-4 py-8 relative z-10">
        <ConnectionStatus />

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl space-y-4">
            <Link
              to="/dashboard"
              className="group flex w-fit items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
              Return to Control
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tighter md:text-5xl lg:text-6xl flex items-center gap-4">
                Poll Insights
                <Badge variant="outline" className="h-fit rounded-xl border-primary/20 bg-primary/5 px-4 py-1 text-xs font-black uppercase tracking-widest text-primary">
                  {pollData.poll.status}
                </Badge>
              </h1>
              <p className="mt-4 max-w-xl text-base font-medium text-muted-foreground leading-relaxed">
                <Zap className="inline-block h-4 w-4 mr-2 text-amber-500 fill-amber-500" />
                {pollData.poll.title}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
              <span className={cn("h-2 w-2 rounded-full animate-pulse", isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500")} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {isConnected ? "Live Data Stream" : "Offline Cache"}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="font-black uppercase tracking-widest rounded-xl border-white/10 bg-background/40 backdrop-blur-xl shadow-xl shadow-black/5"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/poll/${pollId}`)
                  toast.success("Connection link copied")
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Link 
                to={`/poll/${pollId}`}
                className={cn(buttonVariants({ variant: "outline" }), "font-black uppercase tracking-widest rounded-xl border-white/10 bg-background/40 backdrop-blur-xl shadow-xl shadow-black/5")}
              >
                <Eye className="mr-2 h-4 w-4" />
                Live View
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
            <TabsList className="bg-background/40 border border-white/10 backdrop-blur-xl p-1.5 rounded-2xl w-fit shadow-2xl">
              <TabsTrigger value="overview" className="rounded-xl px-8 py-3.5 font-black uppercase tracking-widest text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300">
                Overview
              </TabsTrigger>
              <TabsTrigger value="questions" className="rounded-xl px-8 py-3.5 font-black uppercase tracking-widest text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300">
                Questions
              </TabsTrigger>
              <TabsTrigger value="audience" className="rounded-xl px-8 py-3.5 font-black uppercase tracking-widest text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300">
                Audience
              </TabsTrigger>
              <TabsTrigger value="live" className="rounded-xl px-8 py-3.5 font-black uppercase tracking-widest text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300">
                Live Feed
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md w-fit">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                Sync: {freshnessLabel}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="mt-0">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: 20 }}
                className="grid grid-cols-1 gap-6 lg:grid-cols-12 auto-rows-fr"
              >
                {/* Main Response Stats */}
                <motion.div variants={itemVariants} className="lg:col-span-8">
                  <BentoCard variant="gradient" className="h-full p-10 flex flex-col gap-8 group border-primary/20 shadow-primary/5">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
                      <TrendingUp className="h-64 w-64" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                      <div>
                        <h3 className="text-2xl font-black flex items-center gap-3 tracking-tighter">
                          <Users className="h-6 w-6 text-primary" />
                          Response Volume
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground mt-1">Total engagement captured across all sessions</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/5 bg-background/40 p-5 backdrop-blur-sm shadow-inner">
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Captured</p>
                          <p className="mt-1 text-3xl font-black tracking-tighter">{pollData.totalResponses.toLocaleString()}</p>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-background/40 p-5 backdrop-blur-sm shadow-inner">
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Retention</p>
                          <p className="mt-1 text-3xl font-black tracking-tighter">{Math.round(pollData.completionRate * 100)}%</p>
                        </div>
                        <div className="hidden rounded-2xl border border-white/5 bg-background/40 p-5 backdrop-blur-sm shadow-inner sm:block">
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Goal</p>
                          <p className="mt-1 text-3xl font-black tracking-tighter">{pollData.poll.responseGoal || "∞"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-h-70 w-full relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pollData.questions[0]?.options.slice(0, 5)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <XAxis 
                            dataKey="text" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor", opacity: 0.4 }} 
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor", opacity: 0.4 }}
                          />
                          <Tooltip 
                             cursor={{ fill: "rgba(255,255,255,0.03)" }}
                             contentStyle={{ 
                               backgroundColor: "rgba(15, 15, 15, 0.8)", 
                               backdropFilter: "blur(12px)",
                               border: "1px solid rgba(255, 255, 255, 0.1)",
                               borderRadius: "16px",
                               boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                             }}
                             itemStyle={{ color: "#fff", fontWeight: "bold" }}
                          />
                          <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                            {pollData.questions[0]?.options.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </BentoCard>
                </motion.div>

                {/* Engagement Focus */}
                <motion.div variants={itemVariants} className="lg:col-span-4">
                  <BentoCard className="h-full p-8 flex flex-col gap-8 border-white/5 bg-background/30 backdrop-blur-xl">
                    <div>
                      <h3 className="text-xl font-black flex items-center gap-3 tracking-tighter">
                        <Target className="h-6 w-6 text-emerald-500" />
                        Engagement Pulse
                      </h3>
                      <p className="text-sm font-medium text-muted-foreground mt-1">Live snapshot of response quality</p>
                    </div>

                    <div className="space-y-6">
                      <div className="relative h-48 w-48 mx-auto">
                        <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl animate-pulse" />
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Completed', value: pollData.completionRate * 100 },
                                { name: 'Dropped', value: (1 - pollData.completionRate) * 100 }
                              ] as any[]}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={10}
                              dataKey="value"
                              stroke="none"
                            >
                              <Cell fill="var(--primary)" />
                              <Cell fill="rgba(255,255,255,0.05)" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black tracking-tighter">{Math.round(pollData.completionRate * 100)}%</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Retention</span>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-6 hover:bg-white/10 transition-all shadow-lg hover:shadow-primary/5">
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                             <Sparkles className="h-4 w-4 text-amber-500" />
                             Dominant Choice
                          </p>
                          <div className="mt-4 flex items-start justify-between">
                            <div className="max-w-[70%]">
                              <p className="text-xl font-black tracking-tighter truncate">{topOption?.text || "No votes"}</p>
                              <p className="text-sm font-medium text-muted-foreground mt-1">{topOption?.count || 0} participants</p>
                            </div>
                            <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-black px-3 py-1 text-sm rounded-lg">
                              {Math.round(topOption?.percentage || 0)}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </BentoCard>
                </motion.div>

                {/* Latest Activity Preview */}
                <motion.div variants={itemVariants} className="lg:col-span-12">
                   <BentoCard className="p-8 border-white/5 bg-background/30 backdrop-blur-xl overflow-hidden">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-2xl font-black flex items-center gap-3 tracking-tighter">
                            <Activity className="h-6 w-6 text-primary" />
                            Live Signal Feed
                          </h3>
                          <p className="text-sm font-medium text-muted-foreground mt-1">Real-time incoming response metadata</p>
                        </div>
                        <Button variant="ghost" onClick={() => setActiveTab('live')} className="text-xs font-black uppercase tracking-widest group px-4 py-2 hover:bg-primary/5 rounded-xl">
                          View Full Activity <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pollData.recentVotes.length > 0 ? (
                          pollData.recentVotes.slice(0, 3).map((vote) => (
                            <div key={vote.id} className="relative group/vote overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-6 hover:bg-white/10 transition-all hover:scale-[1.02]">
                              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/vote:scale-110 transition-transform">
                                <Users className="h-16 w-16" />
                              </div>
                              <div className="relative z-10 flex items-center gap-4 mb-4">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                                  {vote.respondent?.displayName?.charAt(0) || "A"}
                                </div>
                                <div>
                                  <h4 className="font-black text-lg tracking-tighter">{vote.respondent?.displayName || "Anonymous User"}</h4>
                                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-1 opacity-60">
                                    {formatDistanceToNow(new Date(vote.time), { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="w-full justify-center bg-white/5 border-white/10 font-bold py-2 uppercase tracking-widest text-[10px] rounded-xl">
                                TRACE: {vote.id.slice(0, 12)}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground opacity-40">
                             <WifiOff className="h-12 w-12 mb-4" />
                             <p className="font-black uppercase tracking-[0.2em]">Awaiting Incoming Signal</p>
                          </div>
                        )}
                      </div>
                   </BentoCard>
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="questions" className="mt-0">
               <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {pollData.questions.map((question, qIdx) => (
                  <motion.div key={question.id} variants={itemVariants}>
                    <BentoCard className="p-8 border-white/5 bg-background/30 backdrop-blur-xl group">
                      <div className="flex flex-col lg:flex-row gap-8">
                        <div className="lg:w-1/3 space-y-6">
                           <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="rounded-lg bg-primary/5 border-primary/20 text-primary font-black">Question {qIdx + 1}</Badge>
                                {question.isMandatory && <Badge variant="secondary" className="rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border-amber-500/20">Required</Badge>}
                              </div>
                              <h3 className="text-3xl font-black tracking-tighter leading-tight">{question.text}</h3>
                              <p className="text-base font-medium text-muted-foreground mt-4 flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                {question.totalAnswers.toLocaleString()} Responses
                              </p>
                           </div>

                           <div className="space-y-4 pt-4">
                              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-inner">
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-3">Peak Performer</p>
                                <div className="flex items-center justify-between">
                                   <span className="font-black text-lg truncate max-w-[70%]">
                                      {question.options.reduce((a, b) => a.count > b.count ? a : b).text}
                                   </span>
                                   <Badge className="bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-black px-3 py-1">
                                      {Math.round(question.options.reduce((a, b) => a.count > b.count ? a : b).percentage)}%
                                   </Badge>
                                </div>
                              </div>
                           </div>
                        </div>

                        <div className="lg:w-2/3 min-h-100">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={question.options} layout="vertical" margin={{ left: 20, right: 40 }}>
                                 <XAxis type="number" hide />
                                 <YAxis 
                                    dataKey="text" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false}
                                    width={140}
                                    tick={{ fill: "currentColor", fontSize: 11, fontWeight: 700, opacity: 0.6 }}
                                 />
                                 <Tooltip 
                                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                                    contentStyle={{ 
                                      backgroundColor: "rgba(15, 15, 15, 0.8)", 
                                      backdropFilter: "blur(12px)",
                                      border: "1px solid rgba(255, 255, 255, 0.1)",
                                      borderRadius: "16px",
                                    }}
                                 />
                                 <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={32}>
                                    {question.options.map((_, i) => (
                                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                    ))}
                                 </Bar>
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                      </div>
                    </BentoCard>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="audience" className="mt-0">
               <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Geographic Map */}
                <motion.div variants={itemVariants} className="lg:col-span-7">
                  <BentoCard className="h-full p-8 flex flex-col group border-white/5 bg-background/30 backdrop-blur-xl min-h-125">
                    <div className="absolute right-0 bottom-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-1000">
                      <Globe className="h-64 w-64" />
                    </div>

                    <div className="relative z-10 mb-8">
                      <h3 className="text-3xl font-black flex items-center gap-3 tracking-tighter">
                        <MapPin className="h-8 w-8 text-indigo-500" />
                        Geographic Signal
                      </h3>
                      <p className="text-base font-medium text-muted-foreground mt-1">Global response density by origin point</p>
                    </div>

                    <div className="relative z-10 flex-1 space-y-8 overflow-y-auto max-h-112.5 pr-4 scrollbar-thin">
                      {pollData.audience?.geographic.length > 0 ? (
                        pollData.audience.geographic.map((country) => (
                          <div key={country.code} className="space-y-3">
                            <div className="flex items-center justify-between text-base">
                              <div className="flex items-center gap-4">
                                 <span className="h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]" />
                                 <span className="font-black tracking-tight text-lg">{country.country}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">{country.count.toLocaleString()} Hits</span>
                                <span className="w-16 text-right font-black text-indigo-500 text-xl">{Math.round(country.percentage)}%</span>
                              </div>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
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
                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground opacity-40 py-20">
                          <Globe className="mb-4 h-16 w-16 animate-pulse" />
                          <p className="text-sm font-black uppercase tracking-widest">Collecting Geo Data...</p>
                        </div>
                      )}
                    </div>
                  </BentoCard>
                </motion.div>

                {/* Device Breakdown */}
                <motion.div variants={itemVariants} className="lg:col-span-5">
                   <BentoCard className="h-full p-8 flex flex-col items-center justify-between border-white/5 bg-background/30 backdrop-blur-xl min-h-125">
                      <div className="w-full">
                        <h3 className="text-2xl font-black flex items-center gap-3 tracking-tighter">
                          <Monitor className="h-6 w-6 text-primary" />
                          Device Signal
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground mt-1">Respondent hardware characteristics</p>
                      </div>

                      <div className="relative h-64 w-64 my-8">
                         <div className="absolute inset-0 bg-primary/5 rounded-full blur-[60px] animate-pulse" />
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                               <Pie
                                  data={pollData.audience?.devices.map(d => ({ name: d.type, value: d.count })) as any[]}
                                  innerRadius={80}
                                  outerRadius={110}
                                  paddingAngle={8}
                                  dataKey="value"
                                  stroke="none"
                               >
                                  {pollData.audience?.devices.map((_, i) => (
                                    <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                                  ))}
                               </Pie>
                            </PieChart>
                         </ResponsiveContainer>
                         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <Monitor className="h-8 w-8 text-primary opacity-20 mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Main Signal</span>
                            <span className="text-xl font-black tracking-tighter capitalize">{pollData.audience?.devices[0]?.type || "N/A"}</span>
                         </div>
                      </div>

                      <div className="w-full grid grid-cols-2 gap-4">
                         {pollData.audience?.devices.map((device, i) => (
                           <div key={device.type} className="rounded-2xl border border-white/5 bg-white/5 p-4 flex flex-col items-center justify-center">
                              <div className="flex items-center gap-2 mb-1">
                                 {device.type === 'desktop' && <Laptop className="h-3 w-3" style={{ color: DEVICE_COLORS[i % DEVICE_COLORS.length] }} />}
                                 {device.type === 'mobile' && <Monitor className="h-3 w-3" style={{ color: DEVICE_COLORS[i % DEVICE_COLORS.length] }} />}
                                 {device.type === 'tablet' && <Monitor className="h-3 w-3" style={{ color: DEVICE_COLORS[i % DEVICE_COLORS.length] }} />}
                                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{device.type}</span>
                              </div>
                              <span className="text-xl font-black tracking-tighter">{Math.round(device.percentage)}%</span>
                           </div>
                         ))}
                      </div>
                   </BentoCard>
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="live" className="mt-0">
               <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[2.5rem] border border-white/10 bg-background/40 backdrop-blur-2xl shadow-2xl overflow-hidden"
              >
                <div className="p-8 border-b border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter flex items-center gap-4">
                      Live Stream
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground mt-1">Real-time engagement activity log</p>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                    Synchronized with Server
                  </div>
                </div>

                <div className="p-8">
                  {pollData.recentVotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center mb-6 relative">
                        <Users className="h-12 w-12 text-muted-foreground opacity-20" />
                        <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full animate-spin-slow" />
                      </div>
                      <h4 className="text-2xl font-black tracking-tighter">No Active Signals</h4>
                      <p className="text-sm text-muted-foreground max-w-sm mt-2 font-medium">
                        Your live feed is ready. Once users begin voting, their activity will materialize here in real-time.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-4xl mx-auto">
                      {pollData.recentVotes.map((vote, idx) => (
                        <motion.div
                          key={vote.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between rounded-3xl border border-white/5 bg-white/5 p-6 hover:bg-white/10 hover:border-primary/20 transition-all hover:translate-x-1"
                        >
                          <div className="flex items-center gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-xl shadow-inner">
                              {vote.respondent?.displayName?.charAt(0) || "A"}
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <p className="font-black text-lg tracking-tight">
                                  {vote.respondent?.displayName || "Anonymous User"}
                                </p>
                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest rounded-lg border-white/10 bg-white/5">
                                  {vote.respondent ? "Authenticated" : "Public"}
                                </Badge>
                              </div>
                              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">
                                {vote.respondent?.email || `Session ID: ${vote.id.slice(0, 12)}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <span className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                               <Calendar className="h-3 w-3" />
                               {formatDistanceToNow(new Date(vote.time), { addSuffix: true })}
                            </span>
                            <Badge className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 rounded-lg text-[10px] font-bold">
                               REC #{idx + 1}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  )
}
