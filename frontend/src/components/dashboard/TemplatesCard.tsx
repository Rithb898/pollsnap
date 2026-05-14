import { MessageSquare, Calendar, Vote, Users } from "lucide-react"
import { BentoCard } from "./BentoCard"
import { pollTemplates } from "@/lib/templates"
import { useNavigate } from "react-router"
import { cn } from "@/lib/utils"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  Calendar,
  Vote,
  Users,
}

export function TemplatesCard({ className }: { className?: string }) {
  const navigate = useNavigate()

  return (
    <BentoCard className={cn("flex flex-col", className)}>
      <h3 className="font-heading uppercase tracking-widest text-xs font-bold text-muted-foreground mb-4">
        Start from Template
      </h3>
      <div className="grid grid-cols-2 gap-2 mt-auto">
        {pollTemplates.slice(0, 4).map((template) => {
          const Icon = iconMap[template.icon] || MessageSquare
          return (
            <button
              key={template.id}
              onClick={() => navigate("/polls/new")}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group text-left"
            >
              <div className="bg-background rounded-full p-2 mb-2 shadow-sm group-hover:scale-110 transition-transform">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors text-center line-clamp-1">
                {template.name}
              </span>
            </button>
          )
        })}
      </div>
    </BentoCard>
  )
}
