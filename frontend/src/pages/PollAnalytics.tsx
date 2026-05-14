import { useEffect } from "react"
import { Link, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Copy, Eye, BarChart3, Users, TrendingUp, WifiOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useSocket } from "@/hooks/use-socket"
import { ConnectionStatus } from "@/components/ConnectionStatus"
import useSWR from "swr"
import { analyticsApi, SWR_KEYS } from "@/lib/api"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { formatDistanceToNow } from "date-fns"

export default function PollAnalytics() {
  const { pollId } = useParams()
  const { isConnected, on } = useSocket("/creator", pollId || "")

  const { data: pollData, isLoading, mutate } = useSWR(
    pollId ? SWR_KEYS.pollAnalytics(pollId) : null,
    () => analyticsApi.getPollAnalytics(pollId!)
  )

  useEffect(() => {
    if (!pollId) return

    const unsubResponseNew = on<{ pollId: string; totalResponses: number }>(
      "response:new",
      (data) => {
        if (data.pollId === pollId) {
          // Re-fetch the analytics softly in the background when a new response arrives
          mutate()
        }
      }
    )

    const unsubVoteUpdate = on<{ pollId: string; optionId: string; count: number }>(
      "vote:update",
      (data) => {
        if (data.pollId === pollId) {
          // Instead of complex optimistic UI merging for every option, 
          // we trigger a fast background re-validation of the analytics.
          mutate()
        }
      }
    )

    const unsubPollClosed = on<{ pollId: string }>("poll:closed", () => { mutate() })

    return () => {
      unsubResponseNew()
      unsubVoteUpdate()
      unsubPollClosed()
    }
  }, [on, pollId, mutate])

  if (isLoading || !pollData) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]

  return (
    <div className="space-y-6">
      <ConnectionStatus />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">Poll Analytics</h1>
            <p className="text-muted-foreground">{pollData.poll.title}</p>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : ""}>
            {isConnected ? (
              <span className="flex items-center gap-1.5 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-bold">
                <WifiOff className="h-3 w-3" />
                Offline
              </span>
            )}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/poll/${pollId}`)
            toast.success("Link copied to clipboard")
          }}>
            <Copy className="mr-2 h-4 w-4" /> Copy Link
          </Button>
          <Button variant="outline">
            <Link to={`/poll/${pollId}`}>
              <Eye className="mr-2 h-4 w-4" /> View Poll
            </Link>
          </Button>
          <Button variant="outline">
            <Link to="/dashboard">Back</Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-background/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
              <Users className="h-4 w-4 text-primary" />
              Total Votes
            </CardDescription>
            <CardTitle className="text-4xl font-black">{pollData.totalResponses}</CardTitle>
          </CardHeader>
        </Card>

        {pollData.poll.responseGoal && (
          <Card className="bg-background/60 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Goal Progress
              </CardDescription>
              <CardTitle className="text-4xl font-black">{Math.round(pollData.goalProgress || 0)}%</CardTitle>
            </CardHeader>
          </Card>
        )}

        <Card className="bg-background/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              Completion Rate
            </CardDescription>
            <CardTitle className="text-4xl font-black">{Math.round((pollData.completionRate || 0) * 100)}%</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-background/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Status</Badge>
            </CardDescription>
            <CardTitle className="text-2xl font-black capitalize mt-2">{pollData.poll.status}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="results" className="mt-8">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="mt-6 space-y-6">
          {pollData.questions.map((question) => (
            <Card key={question.id} className="overflow-hidden border-border/50">
              <CardHeader className="bg-muted/30 border-b border-border/50">
                <CardTitle className="text-xl">{question.text}</CardTitle>
                <CardDescription>
                  {question.totalAnswers} total responses recorded
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={question.options}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="text"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        width={150}
                        tick={{ fill: 'currentColor', fontSize: 14, fontWeight: 500 }}
                      />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-popover text-popover-foreground border border-border/50 p-3 rounded-lg shadow-xl">
                                <p className="font-bold mb-1">{data.text}</p>
                                <p className="text-sm">Votes: <span className="font-bold text-primary">{data.count}</span></p>
                                <p className="text-sm">Percentage: <span className="font-bold">{Math.round(data.percentage)}%</span></p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="count"
                        radius={[0, 4, 4, 0]}
                        barSize={32}
                        animationDuration={1000}
                      >
                        {question.options.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Responses</CardTitle>
              <CardDescription>Live feed of users completing this poll</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pollData.recentVotes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    No responses yet. Share your poll to get started!
                  </div>
                ) : (
                  pollData.recentVotes.map((vote) => (
                    <div
                      key={vote.id}
                      className="flex items-center justify-between rounded-lg border p-4 bg-background/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Anonymous Respondent</p>
                          <p className="text-xs text-muted-foreground">ID: {vote.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                        {formatDistanceToNow(new Date(vote.time), { addSuffix: true })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}