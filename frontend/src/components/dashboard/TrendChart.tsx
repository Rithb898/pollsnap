import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import type { TrendDataPoint } from "@/lib/api"
import { BentoCard } from "./BentoCard"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface TrendChartProps {
  data: TrendDataPoint[] | undefined
  loading?: boolean
  className?: string
}

export function TrendChart({ data, loading, className }: TrendChartProps) {
  return (
    <BentoCard span={2} className={cn("min-h-[200px]", className)}>
      <h3 className="font-heading uppercase tracking-widest text-xs font-bold text-muted-foreground mb-4">
        Response Trends
      </h3>
      {loading ? (
        <div className="flex justify-center items-center h-[150px]">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={data || []} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            />
            <YAxis hide axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Area
              type="monotone"
              dataKey="responses"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorResponses)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </BentoCard>
  )
}
