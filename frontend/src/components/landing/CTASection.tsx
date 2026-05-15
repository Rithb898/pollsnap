import { motion } from "motion/react"
import { Link } from "react-router"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-48 px-6 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[64px] border border-primary/20 bg-white/40 backdrop-blur-3xl p-12 md:p-32 overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.05)] group"
        >
          {/* Subtle Background Glows matching Aurora theme */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute -top-1/2 -right-1/4 w-200 h-200 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute -bottom-1/2 -left-1/4 w-150 h-150 bg-indigo-500/10 rounded-full blur-[100px] animate-aurora" />
          </div>

          <div className="max-w-4xl space-y-12 relative z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                <Sparkles className="h-3 w-3" />
                <span>Ready to transform?</span>
              </div>

              <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] font-heading text-foreground">
                Capture the <br />
                <span className="italic text-primary opacity-80">Liquid</span> <br />
                Sentiment.
              </h2>
            </div>

            <p className="text-2xl md:text-3xl font-medium leading-relaxed max-w-2xl text-muted-foreground">
              Join thousands of creators using the most design-obsessed polling platform on the web.
            </p>

            <div className="pt-8 flex flex-wrap gap-10 items-center">
              <Button size="lg" render={<Link to="/register" />} className="h-20 px-12 rounded-3xl text-xl font-black uppercase tracking-widest bg-primary text-white hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-2xl group relative overflow-hidden">
                Get Started Free
                <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
              </Button>

              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tighter text-foreground">12,482</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Live Pollsters</span>
              </div>
            </div>
          </div>

          {/* Abstract Bento-style decorative elements */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden lg:flex items-center justify-center p-12 pointer-events-none">
            <div className="relative w-full aspect-square border border-primary/10 rounded-[48px] bg-white/20 backdrop-blur-xl rotate-12 flex items-center justify-center overflow-hidden group-hover:rotate-6 transition-transform duration-1000">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent" />
              <div className="text-[200px] font-black text-primary/5 tracking-tighter select-none">
                P
              </div>
              {/* Floating pill in the "device" */}
              <div className="absolute bottom-12 left-12 right-12 h-16 rounded-2xl bg-primary shadow-xl flex items-center justify-center text-white font-black uppercase tracking-widest text-xs">
                Live Response
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
