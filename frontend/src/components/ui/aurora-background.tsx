import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export function AuroraBackground({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("relative min-h-screen bg-background text-foreground overflow-hidden", className)}>
      {/* Immersive Aurora Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50 dark:opacity-30 transition-opacity duration-1000">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/30 blur-[140px] animate-aurora mix-blend-screen dark:mix-blend-lighten" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[70%] rounded-full bg-indigo-500/30 blur-[140px] animate-aurora mix-blend-screen dark:mix-blend-lighten [animation-delay:2s]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[70%] h-[60%] rounded-full bg-emerald-500/30 blur-[140px] animate-aurora mix-blend-screen dark:mix-blend-lighten [animation-delay:4s]" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
