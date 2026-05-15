import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const bentoCardVariants = cva(
  "relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-card/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-2xl",
        primary: "bg-primary/80 backdrop-blur-2xl text-primary-foreground border border-white/20 shadow-2xl shadow-primary/20",
        secondary: "bg-secondary/80 backdrop-blur-2xl text-secondary-foreground border border-white/20 shadow-2xl",
        dark: "bg-zinc-950/50 backdrop-blur-2xl text-zinc-50 border border-white/10 dark:bg-zinc-900/50 shadow-2xl",
        gradient: "bg-gradient-to-br from-primary/15 to-primary/5 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-2xl",
        warning: "bg-amber-100/40 backdrop-blur-2xl text-amber-900 border border-white/20 dark:bg-amber-900/20 dark:text-amber-200 dark:border-white/5 shadow-2xl",
        accent: "bg-indigo-100/40 backdrop-blur-2xl text-indigo-900 border border-white/20 dark:bg-indigo-900/20 dark:text-indigo-200 dark:border-white/5 shadow-2xl",
        success: "bg-emerald-100/40 backdrop-blur-2xl text-emerald-900 border border-white/20 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-white/5 shadow-2xl",
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
