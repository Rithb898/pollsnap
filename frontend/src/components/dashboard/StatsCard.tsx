import { BentoCard } from "./BentoCard"
import { Spinner } from "@/components/ui/spinner"

interface StatsCardProps {
  title: string
  value: number | string
  icon?: React.ReactNode
  loading?: boolean
  variant?: "default" | "primary" | "secondary" | "gradient" | "dark" | "warning" | "accent" | "success"
  className?: string
}

export function StatsCard({ title, value, icon, loading, variant = "default", className }: StatsCardProps) {
  return (
    <BentoCard variant={variant} className={className}>
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-start justify-between">
          <h3 className="font-heading uppercase tracking-widest text-xs font-bold opacity-70">{title}</h3>
          {icon && <div className="opacity-50">{icon}</div>}
        </div>
        <div className="mt-4">
          {loading ? (
            <Spinner className="h-8 w-8" />
          ) : (
            <div className="text-4xl md:text-5xl font-black font-heading leading-none tracking-tight">
              {value}
            </div>
          )}
        </div>
      </div>
    </BentoCard>
  )
}
