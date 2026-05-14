import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WifiOff, ArrowRight } from "lucide-react"
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
    <div className="min-h-screen flex flex-col pt-12 pb-24 px-6 md:px-12 max-w-5xl mx-auto animate-in fade-in duration-700">
      <ConnectionStatus />
      
      <div className="flex items-center justify-between mb-16 animate-in slide-in-from-top-4 duration-500">
        <Link to="/" className="text-xl font-bold font-heading">
          PollSnap.
        </Link>
        {getStatusBadge()}
      </div>

      <div className="space-y-4 mb-20 animate-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black leading-[1.1] tracking-tight uppercase">
          {pollData.title}
        </h1>
        {pollData.description && (
          <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl border-l-4 border-primary pl-4">
            {pollData.description}
          </p>
        )}
      </div>

      <div className="grid gap-4 w-full animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
        {pollData.options.map((option, index) => {
          const isClosed = pollData.status === "closed" || pollData.status === "published"
          return (
            <div
              key={option.id}
              className={`relative overflow-hidden border-2 border-border p-6 md:p-8 transition-all duration-300 group
                ${isClosed ? '' : 'cursor-pointer hover:border-primary hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-primary)]'}
              `}
            >
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-2xl md:text-3xl font-bold font-heading tracking-tight flex items-center gap-4">
                  <span className="text-muted-foreground text-lg">{(index + 1).toString().padStart(2, '0')}</span>
                  {option.text}
                </span>
                
                {(isClosed || option.percentage > 0) && (
                  <span className="text-3xl md:text-4xl font-black font-heading text-primary bg-background px-4 py-2 border-2 border-primary rotate-2 group-hover:rotate-0 transition-transform">
                    {option.percentage}%
                  </span>
                )}
              </div>
              
              {(isClosed || option.percentage > 0) && (
                <div
                  className="absolute inset-0 z-0 bg-primary/20 origin-left transition-transform duration-1000 ease-out"
                  style={{ transform: `scaleX(${option.percentage / 100})` }}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 border-t-2 border-border pt-8 animate-in fade-in duration-1000 delay-500 fill-mode-both">
        <div className="text-muted-foreground font-heading font-bold uppercase tracking-widest text-sm">
          {pollData.totalVotes} Total Responses
        </div>
        
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="border-2 font-bold font-heading uppercase tracking-wider"
            render={<Link to={`/poll/${pollId}/results`} />}
          >
            Results
          </Button>
          
          {pollData.status === "active" && (
            <Button size="lg" className="font-bold font-heading uppercase tracking-wider h-12 px-8 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#09090b] transition-all">
              Submit Vote <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}