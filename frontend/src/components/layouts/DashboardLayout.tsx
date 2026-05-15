import { useState, useRef, useEffect } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  Plus, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  ListTodo,
  PieChart,

  MoreVertical,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion } from "motion/react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/polls", label: "My Polls", icon: ListTodo },
  { href: "/analytics", label: "Analytics", icon: PieChart },
]

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Get initials for avatar
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "U"

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <aside className="hidden w-64 border-r border-border/50 bg-background/50 backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex shrink-0 h-16 items-center px-6 mb-2 mt-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <span className="font-heading font-black text-xl tracking-tight">PollSnap</span>
            </Link>
          </div>

          {/* Create Button */}
          <div className="shrink-0 px-4 mb-6">
            <Button 
              className="w-full rounded-xl h-11 font-bold shadow-sm group hover:shadow-md transition-all" 
              onClick={() => navigate('/polls/new')}
            >
              <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              Create Poll
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto space-y-1.5 px-3 py-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            <div className="px-3 mb-2">
              <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-muted-foreground/70">Main Menu</span>
            </div>
            {navItems.map((item) => {
              const isStrictActive = location.pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                    isStrictActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {isStrictActive && (
                    <motion.div 
                      layoutId="active-nav"
                      className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                  <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isStrictActive ? "text-primary" : "")} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Pro Upgrade Banner */}
          <div className="px-4 mb-4">
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="h-12 w-12 text-indigo-500" />
              </div>
              <h4 className="text-xs font-bold font-heading uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">Upgrade to Pro</h4>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">Get unlimited polls and advanced analytics.</p>
              <Button size="sm" variant="outline" className="w-full h-8 text-xs font-bold rounded-lg border-indigo-500/30 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-700 dark:hover:text-indigo-300">
                View Plans
              </Button>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-border/50 relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex w-full items-center gap-3 rounded-xl hover:bg-muted p-2 transition-colors outline-none group cursor-pointer"
            >
              <Avatar className="h-9 w-9 rounded-lg border border-border/50 group-hover:border-border transition-colors">
                <AvatarFallback className="bg-primary/10 text-primary font-bold rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 text-left">
                <span className="text-sm font-bold leading-none mb-1.5 line-clamp-1">{user?.name || "User"}</span>
                <span className="text-[10px] text-muted-foreground line-clamp-1 leading-none">{user?.email}</span>
              </div>
              <MoreVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>

            {isProfileOpen && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-popover text-popover-foreground rounded-xl shadow-lg border border-border/50 p-1 z-50 animate-in fade-in slide-in-from-bottom-2">
                <div className="px-2 py-2.5 border-b border-border/50 mb-1">
                  <p className="text-sm font-medium leading-none mb-1">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
                <Button 
                  variant="ghost"
                  onClick={() => { setIsProfileOpen(false); navigate('/'); }}
                  className="w-full justify-start px-2 py-4 text-sm rounded-lg transition-colors"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => { setIsProfileOpen(false); logout(); }}
                  className="w-full justify-start px-2 py-4 text-sm rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-colors mt-1"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="font-heading font-black text-lg tracking-tight">PollSnap</span>
          </Link>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
