import { motion, useScroll, useTransform } from "motion/react"
import { useRef } from "react"
import { Link } from "react-router"
import { Share2, Zap, BarChart2 } from "lucide-react"

const FEATURES = [
  {
    title: "Viral by Design",
    description: "Every poll is engineered for the feed. Unbranded, beautiful, and impossible to ignore. Sharing is the first-class citizen, not an afterthought.",
    icon: <Share2 className="h-8 w-8" />,
    color: "oklch(65% 0.15 250)", // Indigo
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Liquid Flows",
    description: "We've eliminated the 'Submit' button. Responses are captured in real-time. As soon as a voter clicks, the reveal begins.",
    icon: <Zap className="h-8 w-8" />,
    color: "oklch(75% 0.15 150)", // Emerald
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Pro Analytics",
    description: "Go beyond counts. Track demographics, referral sources, and drop-off points with surgical precision.",
    icon: <BarChart2 className="h-8 w-8" />,
    color: "oklch(60% 0.2 30)", // Rose/Orange
    image: "https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&w=800&q=80"
  }
]

export function NarrativeFeature() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  return (
    <section ref={containerRef} className="relative py-64 px-6 overflow-hidden">
      {/* Liquid Scroll Progress Indicator */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4 z-30">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] rotate-90 mb-8 opacity-40">Scroll</span>
        <div className="h-64 w-[2px] bg-white/10 rounded-full relative overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 w-full bg-primary"
            style={{ height: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }}
          />
        </div>
        <span className="text-primary font-black mt-4">03</span>
      </div>

      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-start">
          
          {/* Sticky Visuals */}
          <div className="hidden lg:block sticky top-48 h-[600px]">
            <div className="relative w-full h-full">
              {FEATURES.map((feature, i) => {
                const range = [i / FEATURES.length, (i + 1) / FEATURES.length]
                const opacity = useTransform(scrollYProgress, range, [0, 1])
                const scale = useTransform(scrollYProgress, range, [0.85, 1])
                const rotate = useTransform(scrollYProgress, range, [8, 0])
                const y = useTransform(scrollYProgress, range, [20, 0])

                return (
                  <motion.div
                    key={i}
                    style={{ opacity, scale, rotate, y }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-full aspect-square rounded-[80px] border border-white/20 bg-white/5 backdrop-blur-3xl shadow-[0_64px_128px_rgba(0,0,0,0.3)] overflow-hidden relative group">
                      
                      {/* Section 1: Viral by Design (With Image) */}
                      {i === 0 && (
                        <div className="absolute inset-0 z-0">
                          <img src={feature.image} alt="" className="h-full w-full object-cover opacity-20 grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-transparent" />
                        </div>
                      )}

                      {/* Sections 2 & 3: High-end abstract visuals without images */}
                      {i !== 0 && (
                        <div className="absolute inset-0 z-0 overflow-hidden">
                           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-aurora" />
                           <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
                           {/* Pattern overlay */}
                           <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]" />
                        </div>
                      )}

                      <div className="relative z-10 flex flex-col items-center justify-center p-12 h-full text-center">
                        <motion.div 
                          className="p-10 rounded-[40px] bg-gradient-to-br from-white/10 to-transparent border border-white/20 mb-10 shadow-2xl relative"
                          animate={{ y: [0, -15, 0] }}
                          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        >
                           <div className="absolute -inset-4 bg-primary/20 blur-2xl opacity-50 rounded-full" />
                           <div className="relative text-primary">
                             {feature.icon}
                           </div>
                        </motion.div>
                        
                        <div className="space-y-6 max-w-xs">
                          <h3 className="text-3xl font-black tracking-tight">{feature.title}</h3>
                          <div className="h-1.5 w-16 bg-primary/20 rounded-full mx-auto overflow-hidden">
                            <motion.div 
                              className="h-full bg-primary"
                              initial={{ width: 0 }}
                              whileInView={{ width: "100%" }}
                              transition={{ duration: 1.5, delay: 0.5 }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Glow indicator */}
                      <div 
                        className="absolute bottom-0 left-0 w-full h-1"
                        style={{ backgroundColor: feature.color }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Scrolling Content */}
          <div className="space-y-64 lg:py-32">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ margin: "-150px" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-10"
              >
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-[32px] bg-primary/10 text-primary mb-6 lg:hidden border border-primary/20">
                  {feature.icon}
                </div>
                
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-[0.5em] text-primary">Chapter 0{i + 1}</span>
                  <div className="h-0.5 w-8 bg-primary/40 rounded-full" />
                </div>

                <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] font-heading">
                  {feature.title.split(' ').map((word, idx) => (
                    <span key={idx} className={idx === 1 ? "text-primary italic opacity-80" : ""}>
                      {word}{' '}
                      {idx === 0 && <br />}
                    </span>
                  ))}
                </h2>
                
                <p className="text-2xl text-muted-foreground leading-relaxed max-w-xl font-medium">
                  {feature.description}
                </p>
                
                <div className="pt-6">
                   <Link key={i} to="/features" className="group inline-flex items-center gap-4 text-lg font-black uppercase tracking-widest text-primary hover:gap-6 transition-all duration-500">
                     Explore mechanics
                     <ArrowRight className="h-6 w-6 stroke-[3px]" />
                   </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  )
}

