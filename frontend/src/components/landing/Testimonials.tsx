import { BentoCard } from "@/components/dashboard/BentoCard"

export function Testimonials() {
  return (
    <section className="py-24 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">What our customers are saying about PollSnap</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join the increasing number of customers and advocates who rely on PollSnap for seamless and effective engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <BentoCard className="relative min-h-[400px] overflow-hidden p-0 border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent z-0" />
            <div className="relative z-10 p-8 md:p-12 h-full flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-24 bg-primary/20 rounded flex items-center justify-center text-[10px] font-bold text-primary uppercase tracking-widest">
                    Netflix
                  </div>
                </div>
                <h3 className="text-2xl md:text-4xl font-bold leading-tight">
                  PollSnap implemented our audience feedback suite to <span className="text-primary">increase engagement by 62%</span> during peak voting hours.
                </h3>
                <button className="h-10 px-6 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors">
                  Read Case Study
                </button>
                <blockquote className="text-lg italic text-muted-foreground border-l-4 border-primary pl-6">
                  "Using PollSnap has been like unlocking a secret design superpower. It's the perfect fusion of simplicity and versatility."
                </blockquote>
                <div className="flex items-center gap-3 pt-4">
                  <img src="https://i.pravatar.cc/100?img=11" className="h-12 w-12 rounded-full ring-2 ring-background shadow-xl" alt="" />
                  <div>
                    <p className="font-bold">Shaylee</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Design Engineer</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full h-full min-h-[200px] bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl border border-white/10 backdrop-blur-3xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:scale-110 transition-transform duration-700" />
              </div>
            </div>
          </BentoCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BentoCard className="p-8 border-white/20 space-y-6">
            <blockquote className="text-lg leading-relaxed text-muted-foreground">
              "PollSnap has transformed the way I develop web applications. Their extensive collection of UI components, blocks, and templates has significantly accelerated my workflow."
            </blockquote>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/100?img=12" className="h-10 w-10 rounded-full" alt="" />
                <div>
                  <p className="font-bold text-sm">Mina-han Jeung</p>
                  <p className="text-xs text-muted-foreground">Backend Engineer</p>
                </div>
              </div>
              <div className="h-6 w-12 bg-emerald-500/10 rounded flex items-center justify-center text-[8px] font-bold text-emerald-500 uppercase">Hulu</div>
            </div>
          </BentoCard>

          <BentoCard className="p-8 border-white/20 space-y-6">
            <blockquote className="text-lg leading-relaxed text-muted-foreground">
              "Their extensive collection of UI components, blocks, and templates has significantly accelerated my workflow. The flexibility to customize every aspect allows me to create unique user experiences."
            </blockquote>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/100?img=13" className="h-10 w-10 rounded-full" alt="" />
                <div>
                  <p className="font-bold text-sm">Theo Ballick</p>
                  <p className="text-xs text-muted-foreground">Product Designer</p>
                </div>
              </div>
              <div className="h-6 w-12 bg-indigo-500/10 rounded flex items-center justify-center text-[8px] font-bold text-indigo-500 uppercase">Vercel</div>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  )
}
