import { motion } from "motion/react"
import { Link } from "react-router"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import confetti from "canvas-confetti"

export function HeroRevamp() {
  const handleVote = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#10b981', '#f43f5e']
    })
  }

  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
      {/* Background Gradients only (No Image) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[140px] animate-aurora" />
        <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Text Content */}
        <div className="lg:col-span-7 space-y-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-6">
              <Sparkles className="h-3 w-3" />
              <span>Next Gen Polling</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-[120px] font-bold leading-[0.85] tracking-tighter mb-8 font-heading">
              Capturing <br />
              <span className="text-primary italic">Opinions</span> <br />
              In Style.
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-xl leading-relaxed">
              We've replaced clunky forms with immersive, liquid flows. One question. One second. Instant impact.
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-wrap gap-8 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Button size="lg" render={<Link to="/register" />} className="h-20 px-12 rounded-[24px] text-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 group">
              Start Polling
              <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
            </Button>
            
            <Link to="/features" className="text-sm font-black uppercase tracking-[0.3em] border-b-2 border-primary/20 hover:border-primary transition-all pb-2">
              See the reveal
            </Link>
          </motion.div>
        </div>

        {/* Liquid Interactive Element */}
        <div className="lg:col-span-5 relative group">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative perspective-2000">
              <div className="absolute -inset-20 bg-primary/20 blur-[140px] opacity-0 group-hover:opacity-40 transition-opacity duration-1000" />
              
              <div className="relative rounded-[48px] border border-white/20 bg-white/5 backdrop-blur-3xl p-10 shadow-[0_64px_128px_rgba(0,0,0,0.3)] transition-all duration-1000 group-hover:rotate-y-[-12deg] group-hover:rotate-x-[6deg] overflow-hidden">
                {/* Internal UI Mockup background */}
                <div className="absolute inset-0 -z-10 opacity-10 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80')] bg-cover" />
                
                <div className="space-y-12">
                  <div className="space-y-4">
                    <div className="h-1.5 w-16 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.5)]" />
                    <h3 className="text-3xl font-black tracking-tight leading-none">Would you switch to PollSnap?</h3>
                  </div>

                  <div className="space-y-6">
                    {[
                      { label: "Immediately", progress: 78, color: "bg-primary" },
                      { label: "Thinking about it", progress: 22, color: "bg-white/10" }
                    ].map((opt, i) => (
                      <button 
                        key={i} 
                        onClick={handleVote}
                        className="w-full text-left group/opt"
                      >
                        <div className="flex justify-between items-center mb-3 px-1">
                          <span className="text-xs font-black uppercase tracking-[0.2em]">{opt.label}</span>
                          <span className="text-sm font-black">{opt.progress}%</span>
                        </div>
                        <div className="h-5 w-full bg-white/5 rounded-2xl overflow-hidden border border-white/10 p-1">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${opt.progress}%` }}
                            transition={{ duration: 2, delay: 1.2 + i * 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className={`h-full ${opt.color} rounded-xl shadow-lg shadow-black/20`}
                          />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-8 flex items-center justify-between border-t border-white/10">
                    <div className="flex -space-x-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-12 w-12 rounded-2xl border-2 border-background bg-zinc-800 overflow-hidden ring-4 ring-primary/5 transition-transform hover:-translate-y-1">
                           <img src={`https://i.pravatar.cc/150?img=${i + 30}`} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Live Feed</p>
                      <p className="text-2xl font-black tracking-tighter leading-none">12,482</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
