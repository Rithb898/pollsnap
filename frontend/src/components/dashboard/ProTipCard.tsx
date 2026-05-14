import { BentoCard } from "./BentoCard"
import { Lightbulb } from "lucide-react"
import { motion } from "motion/react"

export function ProTipCard({ className }: { className?: string }) {
  return (
    <BentoCard variant="warning" className={className}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 h-full">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="bg-amber-200 dark:bg-amber-800 p-3 rounded-xl text-amber-700 dark:text-amber-300 shrink-0"
          >
            <Lightbulb className="h-6 w-6" />
          </motion.div>
          <div>
            <h3 className="font-heading uppercase tracking-widest text-xs font-black opacity-80 mb-1">Pro Tip</h3>
            <p className="text-sm font-medium leading-relaxed">
              Keep your polls under 5 questions to maximize completion rate. Shorter polls convert <span className="font-bold underline decoration-amber-400 underline-offset-2">40% better!</span>
            </p>
          </div>
        </div>
      </div>
    </BentoCard>
  )
}
