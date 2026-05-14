import { useState, useEffect } from "react"
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
import { Copy, Eye, BarChart3, Users, Clock, TrendingUp, WifiOff } from "lucide-react"
import { toast } from "sonner"
import { useSocket } from "@/hooks/use-socket"
import { ConnectionStatus } from "@/components/ConnectionStatus"

interface Option {
  id: string
  text: string
  votes: number
  percentage: number
  trend?: string
}

interface RecentVote {
  id: string
  option: string
  time: string
}

interface PollData {
  id: string
  title: string
  totalVotes: number
  avgTimeToVote: string
  completionRate: number
  options: Option[]
  recentVotes: RecentVote[]
}

const mockAnalytics: PollData = {
  id: "1",
  title: "Best programming language for beginners?",
  totalVotes: 60,
  avgTimeToVote: "12s",
  completionRate: 94,
  options: [
    { id: "1", text: "Python", votes: 24, percentage: 40, trend: "+5%" },
    { id: "2", text: "JavaScript", votes: 18, percentage: 30, trend: "+2%" },
    { id: "3", text: "Ruby", votes: 12, percentage: 20, trend: "-1%" },
    { id: "4", text: "Go", votes: 6, percentage: 10, trend: "0%" },
  ],
  recentVotes: [
    { id: "1", option: "Python", time: "2 mins ago" },
    { id: "2", option: "JavaScript", time: "5 mins ago" },
    { id: "3", option: "Python", time: "8 mins ago" },
    { id: "4", option: "Ruby", time: "12 mins ago" },
    { id: "5", option: "Python", time: "15 mins ago" },
  ],
}

export default function PollAnalytics() {
  const { pollId } = useParams()
  const [pollData, setPollData] = useState<PollData>(mockAnalytics)
  const { isConnected, on } = useSocket("/creator", pollId || "")

  useEffect(() => {
    const unsubResponseNew = on<{ pollId: string; totalResponses: number }>(
      "response:new",
      (data) => {
        setPollData((prev) => ({
          ...prev,
          totalVotes: data.totalResponses,
        }))
      }
    )

    const unsubVoteUpdate = on<{ pollId: string; optionId: string; count: number }>(
      "vote:update",
      (data) => {
        setPollData((prev) => {
          const newOptions = prev.options.map((opt) => {
            if (opt.id === data.optionId) {
              return { ...opt, votes: data.count }
            }
            return opt
          })

          const totalVotes = newOptions.reduce((sum, opt) => sum + opt.votes, 0)
          const updatedOptions = newOptions.map((opt) => ({
            ...opt,
            percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0,
          }))

          return { ...prev, options: updatedOptions, totalVotes }
        })
      }
    )

    const unsubPollClosed = on<{ pollId: string }>("poll:closed", () => {})

    const unsubPollPublished = on<{ pollId: string }>("poll:published", () => {})

    return () => {
      unsubResponseNew()
      unsubVoteUpdate()
      unsubPollClosed()
      unsubPollPublished()
    }
  }, [on])

  return (
    <div className="space-y-6">
      <ConnectionStatus />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">Poll Analytics</h1>
            <p className="text-muted-foreground">{pollData.title}</p>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "bg-green-500" : ""}>
            {isConnected ? (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1">
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
          <Button variant="outline" render={<Link to={`/poll/${pollId}`} />}>
            <Eye className="mr-2 h-4 w-4" /> View Poll
          </Button>
          <Button variant="outline" render={<Link to="/dashboard" />}>
            Back
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Votes
            </CardDescription>
            <CardTitle className="text-3xl">{pollData.totalVotes}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg. Time to Vote
            </CardDescription>
            <CardTitle className="text-3xl">{pollData.avgTimeToVote}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Completion Rate
            </CardDescription>
            <CardTitle className="text-3xl">{pollData.completionRate}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Options
            </CardDescription>
            <CardTitle className="text-3xl">{pollData.options.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="results">
        <TabsList>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Vote Distribution</CardTitle>
              <CardDescription>Breakdown of votes by option</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pollData.options.map((option, index) => (
                <div key={option.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {index === 0 && "🏆 "}
                      {option.text}
                    </span>
                    <div className="flex items-center gap-2">
                      {option.trend && (
                        <Badge variant={option.trend.startsWith("+") ? "default" : "secondary"}>
                          {option.trend}
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {option.votes} votes ({option.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        index === 0 ? "bg-primary" : "bg-primary/50"
                      }`}
                      style={{ width: `${option.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Votes</CardTitle>
              <CardDescription>Latest voting activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pollData.recentVotes.map((vote) => (
                  <div
                    key={vote.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span className="font-medium">{vote.option}</span>
                    <span className="text-sm text-muted-foreground">{vote.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}