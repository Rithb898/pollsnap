import { BentoCard } from "./BentoCard"
import { Activity, Clock, Inbox } from "lucide-react"
import { motion } from "motion/react"
import useSWR from "swr"
import { SWR_KEYS, dashboardApi } from "@/lib/api"
import { Spinner } from "@/components/ui/spinner"
import { formatDistanceToNow } from "date-fns"

export function RecentActivityCard({ className }: { className?: string }) {
  const { data: activities, isLoading } = useSWR(
    SWR_KEYS.dashboardRecentActivity(),
    () => dashboardApi.getRecentActivity()
  )

  return (
    <BentoCard variant="default" className={className}>
      <div className="flex flex-col h-full max-h-[400px]">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-heading uppercase tracking-widest text-xs font-bold opacity-70">Recent Activity</h3>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400"
          >
            <Activity className="h-4 w-4" />
          </motion.div>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {isLoading ? (
            <div className="flex justify-center items-center h-full min-h-[150px]">
              <Spinner className="h-6 w-6" />
            </div>
          ) : !activities || activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-muted-foreground opacity-70">
              <Inbox className="h-8 w-8 mb-3 opacity-50" />
              <p className="text-sm font-medium">No activity yet</p>
              <p className="text-[10px] uppercase tracking-wider text-center mt-1">Share a poll to get started</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {activities.map((activity, i) => (
                <motion.li 
                  key={activity.id} 
                  className="flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-muted/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="mt-0.5 rounded-full p-2 shrink-0 bg-primary/10 text-primary">
                    <Clock className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-sm leading-tight mb-1">
                      <span className="font-bold">{activity.user}</span> {activity.action}{" "}
                      <span className="font-bold text-foreground/80">{activity.poll}</span>
                    </p>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{formatDistanceToNow(new Date(activity.time))} ago</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </BentoCard>
  )
}
