import { Link } from "react-router"
import { useAuthStore } from "@/store/auth-store"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Copy, Plus, BarChart3, Edit } from "lucide-react"
import { toast } from "sonner"
import { pollsApi, SWR_KEYS, dashboardApi, type PollDTO } from "@/lib/api"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { TrendChart } from "@/components/dashboard/TrendChart"
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard"
import { TemplatesCard } from "@/components/dashboard/TemplatesCard"
import { CompletionRate } from "@/components/dashboard/CompletionRate"
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard"
import { AudienceInsightsCard } from "@/components/dashboard/AudienceInsightsCard"
import { PlanUsageCard } from "@/components/dashboard/PlanUsageCard"
import { ProTipCard } from "@/components/dashboard/ProTipCard"

export default function Dashboard() {
  const { user } = useAuthStore()

  const { data: pollsData, isLoading: pollsLoading } = useSWR(
    SWR_KEYS.polls(),
    () => pollsApi.list(1, 10) as Promise<{ data: PollDTO[]; pagination: { total: number } }>
  )

  const { data: stats, isLoading: statsLoading } = useSWR(
    SWR_KEYS.dashboardStats(),
    () => dashboardApi.getStats()
  )

  const { data: trends, isLoading: trendsLoading } = useSWR(
    SWR_KEYS.dashboardTrends(7),
    () => dashboardApi.getTrends(7)
  )

  const polls = pollsData?.data || []
  const totalPolls = pollsData?.pagination?.total || polls.length
  const publishedPolls = polls.filter((p) => p.status === "closed" || p.status === "active").length

  return (
    // <div className="space-y-8 max-w-7xl mx-auto pb-24">
    <div className="container space-y-8 mx-auto px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, <span className="text-foreground font-medium">{user?.name || "User"}</span>.
          </p>
        </div>
        <Button size="lg" className="font-heading uppercase tracking-wider font-bold" render={<Link to="/polls/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Poll
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Row 1 & 2 */}
        <TrendChart data={trends} loading={trendsLoading} className="col-span-2 md:col-span-4 lg:col-span-4 row-span-2" />

        <StatsCard
          title="Total Responses"
          value={stats?.totalResponses ?? polls.reduce((acc, p) => acc + (p.responseCount || 0), 0)}
          loading={statsLoading}
          variant="primary"
          className="col-span-2 md:col-span-2 lg:col-span-2 row-span-2"
        />

        {/* Row 3 */}
        <StatsCard
          title="Total Polls"
          value={stats?.totalPolls ?? totalPolls}
          loading={statsLoading}
          icon={<BarChart3 className="h-4 w-4" />}
          className="col-span-1 md:col-span-2 lg:col-span-2"
        />

        <StatsCard
          title="Active Polls"
          value={stats?.activePolls ?? publishedPolls}
          loading={statsLoading}
          variant="secondary"
          className="col-span-1 md:col-span-2 lg:col-span-2"
        />

        <CompletionRate rate={stats?.completionRate ?? 0} loading={statsLoading} className="col-span-2 md:col-span-4 lg:col-span-2" />

        {/* Row 4 */}
        <RecentActivityCard className="col-span-2 md:col-span-4 lg:col-span-3 lg:row-span-2" />

        <QuickActionsCard className="col-span-2 md:col-span-2 lg:col-span-3" />

        {/* Row 5 */}
        <TemplatesCard className="col-span-2 md:col-span-2 lg:col-span-3" />

        {/* Row 6 */}
        <AudienceInsightsCard className="col-span-2 md:col-span-4 lg:col-span-4" />
        <PlanUsageCard className="col-span-2 md:col-span-2 lg:col-span-2" />

        {/* Row 7 */}
        <ProTipCard className="col-span-2 md:col-span-6 lg:col-span-6" />
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading uppercase tracking-widest">Your Polls</h2>
        </div>

        {pollsLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : polls.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl p-12 text-center flex flex-col items-center">
            <h3 className="text-xl font-heading font-bold mb-2">No polls yet</h3>
            <p className="text-muted-foreground mb-6">Your audience is waiting.</p>
            <Button className="font-heading uppercase tracking-wider" render={<Link to="/polls/new" />}>
              Start Polling
            </Button>
          </div>
        ) : (
          <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {polls.map((poll) => (
              <div
                key={poll.id}
                className="group flex-shrink-0 w-[280px] snap-start bg-card border border-border rounded-2xl p-5 transition-all hover:shadow-lg hover:border-primary/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge variant={poll.status === "active" ? "default" : "secondary"} className="text-[10px] uppercase tracking-wider font-bold">
                    {poll.status}
                  </Badge>
                  <div className="text-sm font-heading font-bold">
                    {poll.responseCount || 0} responses
                  </div>
                </div>

                <h3 className="text-lg font-bold font-heading mb-2 line-clamp-2">{poll.title}</h3>

                <p className="text-xs text-muted-foreground mb-4">
                  Created {new Date(poll.createdAt).toLocaleDateString()}
                </p>

                <div className="flex gap-2 mt-auto">
                  {poll.status === "draft" && (
                    <Button variant="outline" size="sm" className="flex-1 text-xs font-heading uppercase font-bold" render={<Link to={`/polls/${poll.id}/edit`} />}>
                      <Edit className="mr-1 h-3 w-3" /> Edit
                    </Button>
                  )}
                  {(poll.status === "closed" || poll.status === "active") && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-heading uppercase font-bold"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/poll/${poll.id}`)
                          toast.success("Link copied to clipboard")
                        }}
                      >
                        <Copy className="mr-1 h-3 w-3" /> Copy
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs font-heading uppercase font-bold"
                        render={<Link to={`/polls/${poll.id}/analytics`} />}
                      >
                        <BarChart3 className="mr-1 h-3 w-3" /> Analytics
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
