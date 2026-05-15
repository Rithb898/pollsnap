import { BentoCard } from "@/components/dashboard/BentoCard"
import { BarChart3, Fingerprint, Palette, Share2 } from "lucide-react"

export function FeatureGrid() {
  return (
    <section className="py-24 px-4 relative z-10">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading font-black mb-4">Everything you need. Nothing you don't.</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Built for speed, designed for engagement.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <BentoCard span={2} variant="gradient" className="min-h-[300px] flex flex-col justify-between group">
            <div>
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Real-time Analytics</h3>
              <p className="text-muted-foreground">Watch the votes roll in live. No refreshing needed. Our WebSockets do the heavy lifting.</p>
            </div>
            <div className="mt-8 flex gap-2 overflow-hidden">
              <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden flex">
                <div className="h-full bg-primary w-[70%] animate-pulse" />
              </div>
              <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden flex">
                <div className="h-full bg-primary w-[30%] animate-pulse" />
              </div>
            </div>
          </BentoCard>
          
          <BentoCard span={2} className="min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Custom Branding</h3>
              <p className="text-muted-foreground">Match your brand perfectly with custom colors, dark/light modes, and logo uploads.</p>
            </div>
            <div className="flex gap-4 mt-8">
              <div className="w-8 h-8 rounded-full bg-primary shadow-lg ring-2 ring-background" />
              <div className="w-8 h-8 rounded-full bg-emerald-500 shadow-lg ring-2 ring-background" />
              <div className="w-8 h-8 rounded-full bg-amber-500 shadow-lg ring-2 ring-background" />
              <div className="w-8 h-8 rounded-full bg-rose-500 shadow-lg ring-2 ring-background" />
            </div>
          </BentoCard>

          <BentoCard span={2}>
             <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 mb-4">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">Anonymous & Secure</h3>
              <p className="text-muted-foreground">Advanced fingerprinting prevents double voting while keeping respondents completely anonymous.</p>
          </BentoCard>

          <BentoCard span={2} className="bg-card/50 backdrop-blur-sm">
             <div className="h-10 w-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-500 mb-4">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">Embed Anywhere</h3>
              <p className="text-muted-foreground">iFrames, React components, or raw links. Your poll lives wherever your audience is.</p>
          </BentoCard>
        </div>
      </div>
    </section>
  )
}
