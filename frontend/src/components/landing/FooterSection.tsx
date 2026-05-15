import { Link } from "react-router"
import { BarChart3, MessageCircle, Share2 } from "lucide-react"

export function FooterSection() {
  return (
    <footer className="py-20 px-4 border-t">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">PollSnap</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              PollSnap is a platform for building AI-powered applications. We provide the fastest way to capture opinions and create virality.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Solutions</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Partnerships</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Mobile App</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Career</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Privacy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Community</h4>
            <div className="flex gap-4">
              <Link to="#" className="h-10 w-10 rounded-full border flex items-center justify-center text-muted-foreground hover:bg-muted transition-all">
                <MessageCircle className="h-4 w-4" />
              </Link>
              <Link to="#" className="h-10 w-10 rounded-full border flex items-center justify-center text-muted-foreground hover:bg-muted transition-all">
                <Share2 className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PollSnap. All rights reserved.
          </p>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-emerald-500/5 text-emerald-500 text-xs font-medium">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            All Systems Normal
          </div>
        </div>
      </div>
    </footer>
  )
}
