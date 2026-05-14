import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { BentoCard } from "./BentoCard"
import { cn } from "@/lib/utils"

interface CompletionRateProps {
  rate: number
  loading?: boolean
  className?: string
}

export function CompletionRate({ rate, loading, className }: CompletionRateProps) {
  const getColor = (value: number) => {
    if (value >= 80) return "hsl(142, 71%, 45%)"
    if (value >= 50) return "hsl(38, 92%, 50%)"
    return "hsl(0, 72%, 51%)"
  }

  const color = getColor(rate)
  const data = [
    { value: rate },
    { value: 100 - rate },
  ]

  return (
    <BentoCard className={cn("flex flex-col items-center justify-center min-h-[140px]", className)}>
      <h3 className="font-heading uppercase tracking-widest text-xs font-bold text-muted-foreground mb-2">
        Completion Rate
      </h3>
      {loading ? null : (
        <div className="relative w-20 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={36}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                <Cell fill={color} />
                <Cell fill="hsl(var(--muted))" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-lg font-black font-heading", rate >= 80 && "text-green-500", rate >= 50 && rate < 80 && "text-yellow-500", rate < 50 && "text-red-500")}>
              {rate}%
            </span>
          </div>
        </div>
      )}
    </BentoCard>
  )
}
