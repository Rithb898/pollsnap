import { Link } from "react-router"
import { useAuthStore } from "@/store/auth-store"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Plus, BarChart3, Edit } from "lucide-react"
import { pollsApi, SWR_KEYS, type PollDTO } from "@/lib/api"

export default function Dashboard() {
  const { user } = useAuthStore()
  
  const { data: pollsData, isLoading } = useSWR(
    SWR_KEYS.polls(),
    () => pollsApi.list(1, 10) as Promise<{ polls: PollDTO[]; total: number }>
  )

  const polls = pollsData?.polls || []

  const totalPolls = polls.length
  const publishedPolls = polls.filter((p) => p.status === "published").length
  const totalResponses = polls.reduce((acc, p) => acc + (p.responseCount || 0), 0)

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
            {isLoading ? (
              <Spinner className="h-8 w-8" />
            ) : (
              <CardTitle className="text-3xl">{totalPolls}</CardTitle>
            )}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Published</CardDescription>
            {isLoading ? (
              <Spinner className="h-8 w-8" />
            ) : (
              <CardTitle className="text-3xl">{publishedPolls}</CardTitle>
            )}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Responses</CardDescription>
            {isLoading ? (
              <Spinner className="h-8 w-8" />
            ) : (
              <CardTitle className="text-3xl">{totalResponses}</CardTitle>
            )}
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Polls</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-8 w-8" />
          </div>
        ) : polls.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No polls yet</CardTitle>
              <CardDescription>
                Create your first poll to get started
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button render={<Link to="/polls/new" />}>
                <Plus className="mr-2 h-4 w-4" />
                Create Poll
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid gap-4">
            {polls.map((poll) => (
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
                    {poll.responseCount || 0} responses
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
        )}
      </div>
    </div>
  )
}