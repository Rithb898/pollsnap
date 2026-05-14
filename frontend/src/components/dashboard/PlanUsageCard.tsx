import { BentoCard } from "./BentoCard"
import { HardDrive } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { motion } from "motion/react"
import useSWR from "swr"
import { SWR_KEYS, dashboardApi } from "@/lib/api"
import { Spinner } from "@/components/ui/spinner"

export function PlanUsageCard({ className }: { className?: string }) {
  const { data, isLoading } = useSWR(
    SWR_KEYS.dashboardPlanUsage(),
    () => dashboardApi.getPlanUsage()
  )

  const responsesUsed = data?.responsesUsed || 0
  const responsesTotal = data?.responsesTotal || 500
  const progress = Math.min((responsesUsed / responsesTotal) * 100, 100)

  return (
    <BentoCard variant="default" className={className}>
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-heading uppercase tracking-widest text-xs font-bold opacity-70">Plan Usage</h3>
          <motion.div
             animate={{ rotate: [0, 10, -10, 0] }}
             transition={{ repeat: Infinity, duration: 4 }}
          >
             <HardDrive className="h-4 w-4 opacity-50" />
          </motion.div>
        </div>
        <div>
          {isLoading ? (
            <div className="flex justify-center my-4">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
            <>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-muted-foreground">Responses</span>
                <span className="font-bold font-heading">{responsesUsed} / {responsesTotal}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-3">
                Free tier limits. <span className="text-primary cursor-pointer hover:underline">Upgrade</span>
              </p>
            </>
          )}
        </div>
      </div>
    </BentoCard>
  )
}
