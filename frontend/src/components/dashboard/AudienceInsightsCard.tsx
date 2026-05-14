import { BentoCard } from "./BentoCard"
import { Users, Smartphone, Monitor, BarChart } from "lucide-react"
import { motion } from "motion/react"
import useSWR from "swr"
import { SWR_KEYS, dashboardApi } from "@/lib/api"
import { Spinner } from "@/components/ui/spinner"
import { Progress } from "@/components/ui/progress"

export function AudienceInsightsCard({ className }: { className?: string }) {
  const { data, isLoading } = useSWR(
    SWR_KEYS.dashboardAudienceInsights(),
    () => dashboardApi.getAudienceInsights()
  )

  const mobile = data?.mobile || 0
  const desktop = data?.desktop || 0
  const isEmpty = !isLoading && mobile === 0 && desktop === 0

  return (
    <BentoCard variant="default" className={className}>
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-heading uppercase tracking-widest text-xs font-bold opacity-70">Audience Insights</h3>
          <motion.div
             animate={{ y: [0, -3, 0] }}
             transition={{ repeat: Infinity, duration: 2.5 }}
             className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400"
          >
            <Users className="h-4 w-4" />
          </motion.div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-20 mt-auto">
            <Spinner className="h-6 w-6" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-24 mt-auto text-muted-foreground opacity-70">
            <BarChart className="h-6 w-6 mb-2 opacity-50" />
            <p className="text-xs font-medium">Not enough data</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mt-auto">
            <motion.div 
              className="bg-muted/30 border border-border/50 rounded-xl p-4 flex flex-col gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400">
                  <Smartphone className="h-5 w-5" />
                  <span className="text-[10px] font-heading uppercase tracking-widest font-bold">Mobile</span>
                </div>
                <span className="text-xl font-black font-heading">{mobile}%</span>
              </div>
              <Progress value={mobile} className="h-1.5 bg-indigo-100 dark:bg-indigo-950 [&>div]:bg-indigo-500" />
            </motion.div>
            
            <motion.div 
              className="bg-muted/30 border border-border/50 rounded-xl p-4 flex flex-col gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sky-500 dark:text-sky-400">
                  <Monitor className="h-5 w-5" />
                  <span className="text-[10px] font-heading uppercase tracking-widest font-bold">Desktop</span>
                </div>
                <span className="text-xl font-black font-heading">{desktop}%</span>
              </div>
              <Progress value={desktop} className="h-1.5 bg-sky-100 dark:bg-sky-950 [&>div]:bg-sky-500" />
            </motion.div>
          </div>
        )}
      </div>
    </BentoCard>
  )
}
