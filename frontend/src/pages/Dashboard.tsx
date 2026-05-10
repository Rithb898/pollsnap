import { Link } from "react-router"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, BarChart3, Edit } from "lucide-react"

const mockPolls = [
  {
    id: "1",
    title: "Best programming language for beginners",
    status: "published",
    responses: 42,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Team lunch preference",
    status: "draft",
    responses: 0,
    createdAt: "2024-01-18",
  },
  {
    id: "3",
    title: "Weekly meeting time",
    status: "published",
    responses: 128,
    createdAt: "2024-01-10",
  },
]

export default function Dashboard() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="text-muted-foreground">
            Manage your polls and view analytics
          </p>
        </div>
        <Button render={<Link to="/polls/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          New Poll
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Polls</CardDescription>
            <CardTitle className="text-3xl">{mockPolls.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-3xl">
              {mockPolls.filter((p) => p.status === "published").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Responses</CardDescription>
            <CardTitle className="text-3xl">
              {mockPolls.reduce((acc, p) => acc + p.responses, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Polls</h2>
        <div className="grid gap-4">
          {mockPolls.map((poll) => (
            <Card key={poll.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{poll.title}</CardTitle>
                    <CardDescription>
                      Created on {new Date(poll.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={poll.status === "published" ? "default" : "secondary"}
                  >
                    {poll.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardFooter className="justify-between">
                <span className="text-sm text-muted-foreground">
                  {poll.responses} responses
                </span>
                <div className="flex gap-2">
                  {poll.status === "draft" && (
                    <Button variant="outline" size="sm" render={<Link to={`/polls/${poll.id}/edit`} />}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  {poll.status === "published" && (
                    <>
                      <Button variant="outline" size="sm" render={<Link to={`/poll/${poll.id}`} />}>
                        View
                      </Button>
                      <Button variant="outline" size="sm" render={<Link to={`/polls/${poll.id}/analytics`} />}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </Button>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
