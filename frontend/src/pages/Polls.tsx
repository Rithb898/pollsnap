import { useState } from "react"
import { useNavigate } from "react-router"
import useSWR from "swr"
import { LayoutDashboard, Grid as GridIcon, Plus, Search, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { SWR_KEYS, pollsApi } from "@/lib/api"
import type { PollDTO } from "@/lib/api"
import { PollCard } from "@/components/polls/PollCard"
import { cn } from "@/lib/utils"

type ViewMode = "bento" | "grid"

export default function Polls() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>("bento")
  const [searchQuery, setSearchQuery] = useState("")

  const { data, isLoading } = useSWR(
    SWR_KEYS.polls(1, 50),
    () => pollsApi.list(1, 50)
  )

  // Using optional chaining and fallback for data structure, assuming it returns an array or an object with data array.
  // We'll treat data as PollDTO[] for standard mapping, but handle pagination object if it returns { data: PollDTO[], total: number }
  const rawPolls: PollDTO[] = Array.isArray(data) ? data : (data as any)?.data || []
  
  const polls = rawPolls.filter(poll => 
    poll.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (poll.description && poll.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const hasPolls = rawPolls.length > 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black font-heading uppercase tracking-tight">My Polls</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and track your audience insights.</p>
        </div>

        {hasPolls && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search polls..." 
                className="pl-9 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
              <button
                onClick={() => setViewMode("bento")}
                className={cn("p-2 rounded-lg transition-colors", viewMode === "bento" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
              >
                <LayoutDashboard className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn("p-2 rounded-lg transition-colors", viewMode === "grid" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
              >
                <GridIcon className="h-4 w-4" />
              </button>
            </div>

            <Button onClick={() => navigate('/polls/new')} className="rounded-xl font-bold">
              <Plus className="mr-2 h-4 w-4" /> New
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : !hasPolls ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-3xl bg-card/50 p-12 text-center"
        >
          <div className="bg-primary/10 p-4 rounded-2xl mb-6 relative">
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-indigo-500 animate-pulse" />
            <LayoutDashboard className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-black font-heading tracking-tight mb-2">Your audience is waiting</h2>
          <p className="text-muted-foreground max-w-md mb-8">Create your first poll to start gathering insights and understanding your audience better.</p>
          <Button onClick={() => navigate('/polls/new')} size="lg" className="rounded-xl font-bold h-12 px-8">
            <Plus className="mr-2 h-5 w-5" />
            Create Your First Poll
          </Button>
        </motion.div>
      ) : polls.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-bold">No polls found</h3>
          <p className="text-muted-foreground">Try adjusting your search query.</p>
        </div>
      ) : (
        <motion.div 
          layout
          className={cn(
            "flex-1",
            viewMode === "bento" && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
            viewMode === "grid" && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          )}
        >
          <AnimatePresence>
            {polls.map((poll, index) => {
              // In bento mode, make the first poll massive if it has responses
              const isFeatured = index === 0;
              return (
                <PollCard 
                  key={poll.id} 
                  poll={poll} 
                  viewMode={viewMode} 
                  isFeatured={isFeatured} 
                />
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
