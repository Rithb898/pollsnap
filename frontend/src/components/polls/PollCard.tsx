import { useState, useRef, useEffect } from "react"
import type { PollDTO } from "@/lib/api"
import { BentoCard } from "@/components/dashboard/BentoCard"
import { Badge } from "@/components/ui/badge"
import { Users, MoreVertical, Edit2, Calendar, Trash2, Target, EyeOff, Eye, Clock, PenTool, BarChart3, LineChart, ExternalLink } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, format } from "date-fns"
import { useNavigate } from "react-router"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface PollCardProps {
  poll: PollDTO
  viewMode: "bento" | "grid"
  isFeatured?: boolean
}

export function PollCard({ poll, viewMode, isFeatured }: PollCardProps) {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const isPublished = poll.status === "closed" // Adjusted to "closed" since "published" is removed
  const responseCount = poll.responseCount || 0
  const goal = poll.responseGoal || 0
  const progress = goal > 0 ? Math.min(100, Math.round((responseCount / goal) * 100)) : 0

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/polls/${poll.id}/edit`)
  }

  const handleAnalytics = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/polls/${poll.id}/analytics`)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Share logic here
    setIsMenuOpen(false)
  }

  // Generate SVG path from activity trend data
  const generateSparklinePath = (data: number[] | undefined, width = 100, height = 40) => {
    if (!data || data.length === 0 || Math.max(...data) === 0) {
      // Mock aesthetic path if no data
      return {
        area: "M0 40 L0 30 C 10 25, 20 35, 40 20 C 60 5, 80 15, 100 5 L100 40 Z",
        line: "M0 30 C 10 25, 20 35, 40 20 C 60 5, 80 15, 100 5"
      }
    }

    const max = Math.max(...data)
    const stepX = width / (data.length - 1)
    
    const points = data.map((val, i) => {
      const x = i * stepX
      const y = height - (val / max) * (height - 10) - 5 // pad top and bottom
      return { x, y }
    })

    let linePath = `M${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const cpX = prev.x + (curr.x - prev.x) / 2
      linePath += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`
    }

    return { 
      area: `${linePath} L${width} ${height} L0 ${height} Z`, 
      line: linePath 
    }
  }

  const { area, line } = generateSparklinePath(poll.activityTrend)

  const renderDropdown = () => (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <MoreVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      {isMenuOpen && (
        <div className="absolute top-full right-0 mt-1 w-36 bg-popover text-popover-foreground rounded-xl shadow-lg border border-border/50 p-1 z-50 animate-in fade-in slide-in-from-top-2">
          <button 
            onClick={handleEdit}
            className="w-full flex items-center px-2 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-left"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); /* Delete logic */ }}
            className="w-full flex items-center px-2 py-2 text-sm rounded-lg hover:bg-red-50 text-red-600 dark:hover:bg-red-950/50 transition-colors text-left mt-1"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  )

  // Avatar Stack logic (mocked visuals based on response count)
  const renderAvatarStack = () => {
    if (responseCount === 0) {
      return (
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[8px] text-muted-foreground/50">
              ?
            </div>
          ))}
        </div>
      )
    }

    const maxAvatars = Math.min(3, responseCount)
    const extraCount = responseCount > 3 ? responseCount - 3 : 0
    const colors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500"]

    return (
      <div className="flex -space-x-2">
        {Array.from({ length: maxAvatars }).map((_, i) => (
          <div key={i} className={cn("h-6 w-6 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold text-white", colors[i % colors.length])}>
            {poll.isAnonymous ? <EyeOff className="h-3 w-3" /> : <Users className="h-3 w-3" />}
          </div>
        ))}
        {extraCount > 0 && (
          <div className="h-6 w-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[8px] font-bold text-muted-foreground">
            +{extraCount > 99 ? '99' : extraCount}
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={handleAnalytics}
      className={cn(
        "cursor-pointer h-full relative",
        viewMode === "bento" && isFeatured ? "md:col-span-2" : "col-span-1"
      )}
    >
      <BentoCard 
        variant={viewMode === "bento" && isFeatured ? "gradient" : "default"} 
        className={cn("h-full flex flex-col group transition-all duration-300 relative overflow-hidden", viewMode === "bento" && isFeatured ? "" : "hover:border-primary/40 hover:shadow-lg")}
      >
        {/* Background Categorical Watermark */}
        <div className="absolute right-[-5%] bottom-[10%] opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
          {!isPublished ? (
            <PenTool className="w-48 h-48" />
          ) : viewMode === "bento" && isFeatured ? (
            <Target className="w-64 h-64" />
          ) : (
            <BarChart3 className="w-48 h-48" />
          )}
        </div>

        {/* Top Header */}
        <div className="flex justify-between items-start mb-4 relative z-10">
          <Badge variant={isPublished ? "default" : "secondary"} className={cn("flex items-center gap-1.5", isPublished ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : "")}>
            {isPublished && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            {poll.status}
          </Badge>
          {renderDropdown()}
        </div>
        
        {/* Main Content */}
        <div className={cn("flex-1 relative z-10", viewMode === "bento" && isFeatured ? "md:grid md:grid-cols-2 md:gap-8 mt-2" : "flex flex-col")}>
          
          {/* Left / Top Side: Info */}
          <div className="flex flex-col flex-1 h-full">
            <h3 className={cn("font-bold mb-2 line-clamp-2", viewMode === "bento" && isFeatured ? "text-3xl tracking-tight" : "text-lg")}>
              {poll.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {poll.description || "No description provided."}
            </p>

            {/* Metadata Chips Row */}
            <div className="flex flex-wrap gap-2 mt-auto mb-2">
              <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {format(new Date(poll.createdAt), "MMM d, yyyy")}
              </div>
              <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground">
                {poll.isAnonymous ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {poll.isAnonymous ? "Anonymous" : "Tracked"}
              </div>
              {poll.expiresAt && (
                <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-600 px-2 py-1 rounded-md text-[10px] font-bold">
                  <Clock className="h-3 w-3" />
                  Ends {formatDistanceToNow(new Date(poll.expiresAt))}
                </div>
              )}
            </div>
          </div>

          {/* Right / Bottom Side: Analytics Sparkline Widget (Option 1) */}
          <div className={cn(
            "rounded-xl border border-border/50 bg-background/40 relative overflow-hidden group-hover:border-primary/20 transition-colors", 
            viewMode === "bento" && isFeatured ? "hidden md:block h-full min-h-[140px]" : "h-24 mt-4 w-full"
          )}>
            {/* Grid Background */}
            <div className="absolute inset-0 flex flex-col justify-between opacity-[0.03]">
              <div className="border-b border-primary w-full h-1/3" />
              <div className="border-b border-primary w-full h-1/3" />
              <div className="w-full h-1/3" />
            </div>
            <div className="absolute inset-0 flex justify-between opacity-[0.03]">
              <div className="border-r border-primary h-full w-1/4" />
              <div className="border-r border-primary h-full w-1/4" />
              <div className="border-r border-primary h-full w-1/4" />
              <div className="h-full w-1/4" />
            </div>
            
            {/* SVG Area Chart */}
            <svg viewBox="0 0 100 40" className="w-full h-full absolute inset-0 drop-shadow-sm" preserveAspectRatio="none">
              <path d={area} className="fill-primary/10" />
              <path d={line} fill="none" strokeWidth="2" className="stroke-primary" strokeLinecap="round" />
            </svg>
          </div>

        </div>

        {/* Footer Data Row */}
        <div className="mt-4 pt-4 border-t border-border/50 relative z-10">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Responses</span>
              <div className="flex items-center gap-3">
                <span className={cn("font-black font-heading leading-none", viewMode === "bento" && isFeatured ? "text-4xl text-primary" : "text-3xl")}>
                  {responseCount}
                </span>
                {renderAvatarStack()}
              </div>
            </div>
            
            {goal > 0 && (
              <div className="flex flex-col items-end w-[45%]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Target className="h-3 w-3" /> Goal: {goal}
                </span>
                <Progress value={progress} className="h-1.5 w-full bg-primary/10" />
              </div>
            )}
            
            {/* Quick Hover Actions (Appears on Hover) */}
            {isPublished && goal === 0 && (
               <div className="absolute right-0 bottom-0 flex gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <Button size="sm" variant="secondary" onClick={handleShare} className="h-8 rounded-lg text-xs font-bold shadow-sm">
                    <ExternalLink className="h-3 w-3 mr-1.5" /> Share
                  </Button>
                  <Button size="sm" onClick={handleAnalytics} className="h-8 rounded-lg text-xs font-bold shadow-sm">
                    <LineChart className="h-3 w-3 mr-1.5" /> Analytics
                  </Button>
               </div>
            )}
          </div>
        </div>
      </BentoCard>
    </motion.div>
  )
}
