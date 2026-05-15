import { motion } from "motion/react"
import { PencilLine, Send, BarChart4 } from "lucide-react"

const STEPS = [
  {
    title: "Draft your vision",
    description: "Use our liquid editor to craft questions that resonate. No complex forms, just pure intent.",
    icon: <PencilLine className="h-10 w-10" />,
    color: "from-blue-500/20 to-indigo-500/20"
  },
  {
    title: "Instant Distribution",
    description: "Get a high-impact, unbranded link that embeds perfectly across all social and workspace platforms.",
    icon: <Send className="h-10 w-10" />,
    color: "from-emerald-500/20 to-teal-500/20"
  },
  {
    title: "Live Intelligence",
    description: "Watch results stream in with surgical precision. Demographics, sentiment, and viral loops revealed.",
    icon: <BarChart4 className="h-10 w-10" />,
    color: "from-purple-500/20 to-pink-500/20"
  }
]

export function ProcessSection() {
  return (
    <section className="py-48 px-6 bg-white/[0.02] border-y border-white/5">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-32 space-y-6">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-sm font-bold uppercase tracking-[0.4em] text-primary"
          >
            The Mechanics
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-bold tracking-tighter leading-none"
          >
            Zero to <span className="italic opacity-50">Impact</span> <br />
            in Seconds.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 -z-10" />
          
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative group text-center"
            >
              <div className={`mx-auto h-32 w-32 rounded-[40px] bg-gradient-to-br ${step.color} border border-white/10 flex items-center justify-center mb-10 shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-6`}>
                <div className="text-primary group-hover:scale-110 transition-transform">
                   {step.icon}
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4 tracking-tight">{step.title}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {step.description}
              </p>
              
              <div className="mt-8 text-6xl font-black text-white/5 select-none italic group-hover:text-primary/10 transition-colors">
                0{i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
