import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const bentoCardVariants = cva(
  "relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-card border border-border",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        dark: "bg-zinc-950 text-zinc-50 border border-zinc-800 dark:bg-zinc-900 dark:border-zinc-800",
        gradient: "bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20",
        warning: "bg-amber-100/50 text-amber-900 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-900/50",
        accent: "bg-indigo-100/50 text-indigo-900 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-200 dark:border-indigo-900/50",
        success: "bg-emerald-100/50 text-emerald-900 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-900/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof bentoCardVariants> {
  span?: 1 | 2 | 3 | 4
}

export function BentoCard({ className, variant, span = 1, children, ...props }: BentoCardProps) {
  return (
    <div
      className={cn(
        bentoCardVariants({ variant }),
        span === 2 && "md:col-span-2",
        span === 3 && "md:col-span-3",
        span === 4 && "md:col-span-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
