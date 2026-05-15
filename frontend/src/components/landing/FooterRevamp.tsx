import { Link } from "react-router"
import { BrandLogo } from "@/components/brand-logo"
import { MessageCircle, Share2, ArrowUpRight } from "lucide-react"

export function FooterRevamp() {
  return (
    <footer className="py-24 px-6 relative border-t border-white/10">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          
          <div className="lg:col-span-5 space-y-8">
            <Link to="/" className="flex items-center gap-3">
              <BrandLogo
                imageClassName="h-10 w-auto"
              />
            </Link>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-sm">
              We're rethinking opinion capture for the modern web. From creators to enterprise, we scale your voice.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <MessageCircle className="h-5 w-5" />, label: "Discord" },
                { icon: <Share2 className="h-5 w-5" />, label: "Twitter" }
              ].map((social, i) => (
                <button key={i} className="h-12 w-12 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all">
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 text-primary">System</h4>
              <ul className="space-y-4 font-bold text-lg">
                <li><Link to="/" className="group flex items-center gap-1 hover:text-primary transition-colors">Home <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
                <li><Link to="/#features" className="group flex items-center gap-1 hover:text-primary transition-colors">Features <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
                <li><Link to="/dashboard" className="group flex items-center gap-1 hover:text-primary transition-colors">Dashboard <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 text-primary">Identity</h4>
              <ul className="space-y-4 font-bold text-lg">
                <li><Link to="/login" className="group flex items-center gap-1 hover:text-primary transition-colors">Sign In <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
                <li><Link to="/register" className="group flex items-center gap-1 hover:text-primary transition-colors">Register <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
                <li><Link to="#" className="group flex items-center gap-1 hover:text-primary transition-colors opacity-40 cursor-not-allowed">Status <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="p-8 rounded-[32px] border border-white/10 bg-white/5 space-y-4 shadow-xl">
                <p className="text-sm font-bold uppercase tracking-widest">Global Infrastructure</p>
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-xl">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  All Systems Up
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-medium text-muted-foreground uppercase tracking-widest">
          <p>© {new Date().getFullYear()} PollSnap Architecture. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="#" className="hover:text-primary">Privacy</Link>
            <Link to="#" className="hover:text-primary">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
