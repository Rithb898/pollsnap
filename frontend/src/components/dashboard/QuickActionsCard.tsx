import { Link } from "react-router"
import { Plus, BarChart3, Copy } from "lucide-react"
import { BentoCard } from "./BentoCard"
import { cn } from "@/lib/utils"

export function QuickActionsCard({ className }: { className?: string }) {
  const actions = [
    { icon: Plus, label: "New Poll", href: "/polls/new" },
    { icon: BarChart3, label: "Analytics", href: "#" },
    { icon: Copy, label: "Templates", href: "#" },
  ]

  return (
    <BentoCard className={cn("flex flex-col", className)}>
      <h3 className="font-heading uppercase tracking-widest text-xs font-bold text-muted-foreground mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-3 gap-3 mt-auto">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
          >
            <div className="bg-background rounded-full p-2 mb-2 group-hover:scale-110 transition-transform shadow-sm">
              <action.icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </BentoCard>
  )
}
