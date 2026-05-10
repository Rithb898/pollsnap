import { Link, useParams } from "react-router"
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

const mockPoll = {
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
}

export default function PublicPoll() {
  const { pollId } = useParams()

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{mockPoll.title}</CardTitle>
              <CardDescription className="mt-2">
                {mockPoll.description}
              </CardDescription>
            </div>
            <Badge variant="secondary">{mockPoll.totalVotes} votes</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockPoll.options.map((option) => (
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
              <div className="absolute inset-0 z-0 bg-muted/50 origin-left" style={{ transform: `scaleX(${option.percentage / 100})` }} />
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" render={<Link to={`/poll/${pollId}/results`} />}>
            View Results
          </Button>
          <Button>Submit Vote</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
