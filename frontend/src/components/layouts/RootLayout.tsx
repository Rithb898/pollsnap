import { Link, Outlet } from "react-router"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/brand-logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User } from "lucide-react"

export default function RootLayout() {
  const { user, isAuthenticated, logout } = useAuthStore()

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <header className="fixed top-8 z-50 w-full px-6 pointer-events-none">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between rounded-[32px] border border-white/20 bg-white/5 px-10 backdrop-blur-3xl shadow-[0_32px_64px_rgba(0,0,0,0.15)] pointer-events-auto transition-all hover:bg-white/10 dark:border-white/5 dark:bg-zinc-900/40">
          <Link to="/" className="flex items-center gap-3 transition-all hover:scale-[1.02] group">
            <BrandLogo
              imageClassName="h-10 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-12">
            {[
              { label: "Home", to: "/" },
              { label: "Features", to: "/#features" },
              { label: "Vault", to: "/dashboard", auth: true }
            ].map((link, i) => (
              (!link.auth || isAuthenticated) && (
                <Link 
                  key={i}
                  to={link.to} 
                  className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground transition-all hover:text-primary hover:tracking-[0.3em]"
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button variant="ghost" className="relative h-12 w-12 rounded-2xl border border-white/10 bg-white/5 transition-all hover:scale-105 active:scale-95">
                    <Avatar className="h-full w-full rounded-2xl">
                      <AvatarFallback className="bg-primary/10 text-primary font-black uppercase">
                        {user?.name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                } />
                <DropdownMenuContent align="end" className="w-64 mt-4 p-2 rounded-[24px] border-white/20 bg-white/5 backdrop-blur-3xl">
                  <div className="flex flex-col space-y-1 p-4">
                    <p className="text-sm font-black uppercase tracking-widest">{user?.name || "Member"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="rounded-xl focus:bg-primary/10 focus:text-primary cursor-pointer p-3">
                    <Link to="/dashboard" className="flex w-full items-center font-bold">
                      <User className="mr-3 h-4 w-4" />
                      View Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={logout} className="rounded-xl focus:bg-destructive/10 text-destructive cursor-pointer p-3 font-bold">
                    <LogOut className="mr-3 h-4 w-4" />
                    Secure Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all">
                  Sign in
                </Link>
                <Button render={<Link to="/register" />} className="h-12 rounded-2xl px-8 font-black uppercase tracking-widest shadow-[0_16px_32px_rgba(var(--primary),0.3)] transition-all hover:scale-105 active:scale-95">
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

    </div>
  )
}
