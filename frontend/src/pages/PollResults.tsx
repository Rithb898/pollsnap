import { useParams, Link } from "react-router"
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

const mockResults = {
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
  winner: "Python",
}

export default function PollResults() {
  const { pollId } = useParams()

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{mockResults.title}</CardTitle>
              <CardDescription className="mt-2">
                {mockResults.description}
              </CardDescription>
            </div>
            <Badge variant="default">
              Winner: {mockResults.winner}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockResults.options.map((option, index) => (
            <div key={option.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {index === 0 && "🏆 "}
                  {option.text}
                </span>
                <span className="text-sm text-muted-foreground">
                  {option.votes} votes ({option.percentage}%)
                </span>
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
        <CardFooter className="justify-between">
          <Button variant="outline" render={<Link to={`/poll/${pollId}`} />}>
            Back to Poll
          </Button>
          <Badge variant="secondary">{mockResults.totalVotes} total votes</Badge>
        </CardFooter>
      </Card>
    </div>
  )
}
