import { motion } from "motion/react"
import { Share2, Zap, BarChart2, Shield, Globe, Cpu } from "lucide-react"

const BENTO_ITEMS = [
  {
    title: "Viral by Design",
    description: "Every poll is engineered for the feed. Unbranded, beautiful, and impossible to ignore. Sharing is the first-class citizen.",
    icon: <Share2 className="h-6 w-6" />,
    className: "md:col-span-2 md:row-span-2 bg-gradient-to-br from-indigo-500/10 via-background to-background border-primary/20",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
    feature: "Social Optimized"
  },
  {
    title: "Liquid Flows",
    description: "No 'Submit' button. Responses are captured in real-time as they happen.",
    icon: <Zap className="h-6 w-6" />,
    className: "md:col-span-2 bg-white/5",
    feature: "Instant Sync"
  },
  {
    title: "Pro Analytics",
    description: "Surgical precision on every vote.",
    icon: <BarChart2 className="h-6 w-6" />,
    className: "bg-white/5",
    feature: "Realtime"
  },
  {
    title: "Secure",
    description: "Enterprise-grade encryption.",
    icon: <Shield className="h-6 w-6" />,
    className: "bg-white/5",
    feature: "Privacy First"
  },
  {
    title: "Global Reach",
    description: "Localized for 40+ languages instantly.",
    icon: <Globe className="h-6 w-6" />,
    className: "md:col-span-1 bg-white/5",
    feature: "L10n"
  },
  {
    title: "API First",
    description: "Connect anything with our headless SDK and webhooks.",
    icon: <Cpu className="h-6 w-6" />,
    className: "md:col-span-3 bg-gradient-to-tr from-primary/10 to-background border-primary/10",
    feature: "Headless"
  }
]

export function BentoFeatures() {
  return (
    <section id="features" className="py-48 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="space-y-6">
            <span className="text-sm font-black uppercase tracking-[0.4em] text-primary">Capabilities</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none font-heading">
              Built for the <br />
              <span className="italic opacity-50 text-primary">Craftsperson.</span>
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-md leading-relaxed">
            We've condensed enterprise polling power into a minimalist bento experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
          {BENTO_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className={`group relative rounded-[32px] border border-white/10 bg-background/40 backdrop-blur-3xl p-10 overflow-hidden flex flex-col justify-between transition-all hover:border-primary/60 hover:bg-background/60 shadow-[0_32px_64px_rgba(0,0,0,0.2)] ${item.className}`}
            >
              {/* Image background for the featured item */}
              {item.image && (
                <div className="absolute inset-0 -z-10 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt="" 
                    className="h-full w-full object-cover opacity-[0.05] grayscale group-hover:scale-110 group-hover:opacity-15 transition-all duration-1000" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                </div>
              )}

              {/* Header Section matching Dashboard pattern */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/60 group-hover:text-primary transition-colors">
                    {item.feature}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-4xl font-black tracking-tighter leading-none group-hover:translate-x-1 transition-transform duration-500">
                    {item.title}
                  </h3>
                  <div className="h-1 w-8 bg-primary/20 rounded-full group-hover:w-16 transition-all duration-700" />
                </div>
              </div>

              {/* Bottom Row: Content */}
              <p className="text-lg text-muted-foreground leading-snug max-w-[240px] group-hover:text-foreground transition-colors font-medium">
                {item.description}
              </p>

              {/* Dashboard-style glow */}
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
