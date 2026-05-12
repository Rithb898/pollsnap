import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WifiOff } from "lucide-react"
import { useSocket } from "@/hooks/use-socket"
import { ConnectionStatus } from "@/components/ConnectionStatus"

interface Option {
  id: string
  text: string
  votes: number
  percentage: number
}

interface PollData {
  id: string
  title: string
  description: string
  options: Option[]
  totalVotes: number
  hasVoted: boolean
  status: "active" | "closed" | "published"
}

const mockPoll: PollData = {
  id: "1",
  title: "Best programming language for beginners?",
  description: "Help us decide which language to recommend to newcomers.",
  options: [
    { id: "1", text: "Python", votes: 24, percentage: 40 },
    { id: "2", text: "JavaScript", votes: 18, percentage: 30 },
    { id: "3", text: "Ruby", votes: 12, percentage: 20 },
    { id: "4", text: "Go", votes: 6, percentage: 10 },
  ],
  totalVotes: 60,
  hasVoted: false,
  status: "active",
}

export default function PublicPoll() {
  const { pollId } = useParams()
  const navigate = useNavigate()
  const [pollData, setPollData] = useState<PollData>(mockPoll)
  const { isConnected, on } = useSocket("/respondent", pollId || "")

  useEffect(() => {
    const unsubVoteUpdate = on<{
      pollId: string
      questionId: string
      optionId: string
      newCount: number
      totalResponses: number
    }>("vote:update", (data) => {
      setPollData((prev) => {
        const newOptions = prev.options.map((opt) => {
          if (opt.id === data.optionId) {
            return { ...opt, votes: data.newCount }
          }
          return opt
        })

        const totalVotes = newOptions.reduce((sum, opt) => sum + opt.votes, 0)
        const updatedOptions = newOptions.map((opt) => ({
          ...opt,
          percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0,
        }))

        return {
          ...prev,
          options: updatedOptions,
          totalVotes: data.totalResponses,
        }
      })
    })

    const unsubPollClosed = on<{ pollId: string }>("poll:closed", () => {
      setPollData((prev) => ({ ...prev, status: "closed" }))
    })

    const unsubPollPublished = on<{ pollId: string }>("poll:published", () => {
      setPollData((prev) => ({ ...prev, status: "published" }))
    })

    return () => {
      unsubVoteUpdate()
      unsubPollClosed()
      unsubPollPublished()
    }
  }, [on])

  const getStatusBadge = () => {
    switch (pollData.status) {
      case "active":
        return isConnected ? (
          <Badge className="bg-green-500">
            <span className="mr-1 h-2 w-2 rounded-full bg-white animate-pulse" />
            Live
          </Badge>
        ) : (
          <Badge variant="secondary">
            <WifiOff className="mr-1 h-3 w-3" />
            Offline
          </Badge>
        )
      case "closed":
        return <Badge variant="destructive">Closed</Badge>
      case "published":
        return <Badge variant="outline">Results Published</Badge>
      default:
        return null
    }
  }

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <ConnectionStatus />
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{pollData.title}</CardTitle>
              <CardDescription className="mt-2">
                {pollData.description}
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {pollData.status === "closed" || pollData.status === "published" ? (
            pollData.options.map((option, index) => (
              <div
                key={option.id}
                className="relative overflow-hidden rounded-lg border p-4"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-medium">
                    {index === 0 && "🏆 "}
                    {option.text}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {option.percentage}%
                  </span>
                </div>
                <div
                  className="absolute inset-0 z-0 bg-muted/50 origin-left"
                  style={{ transform: `scaleX(${option.percentage / 100})` }}
                />
              </div>
            ))
          ) : (
            pollData.options.map((option) => (
              <div
                key={option.id}
                className="relative overflow-hidden rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-medium">{option.text}</span>
                  <span className="text-sm text-muted-foreground">
                    {option.percentage}%
                  </span>
                </div>
                <div
                  className="absolute inset-0 z-0 bg-muted/50 origin-left"
                  style={{ transform: `scaleX(${option.percentage / 100})` }}
                />
              </div>
            ))
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <Button
            variant="outline"
            render={<Link to={`/poll/${pollId}/results`} />}
          >
            View Results
          </Button>
          {pollData.status === "active" && (
            <Button>Submit Vote</Button>
          )}
          {pollData.status === "closed" && (
            <Button disabled>This poll has ended</Button>
          )}
          {pollData.status === "published" && (
            <Button onClick={() => navigate(`/poll/${pollId}/results`)}>
              See Full Results
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}