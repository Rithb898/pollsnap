import { motion } from "motion/react"

const REVIEWS = [
  {
    quote: "The interface is so liquid, I forgot I was filling out a form. Truly extraordinary.",
    author: "Shaylee",
    title: "Design Lead @ Stripe",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    size: "large" // 2x2
  },
  {
    quote: "Virality is built-in. 4x engagement.",
    author: "Marcus",
    title: "Growth @ Linear",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    size: "small" // 1x1
  },
  {
    quote: "On-brand for high-end agencies.",
    author: "Elena",
    title: "Founder @ Studio Fluid",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    size: "small" // 1x1
  },
  {
    quote: "Minimalism done right. Pure magic.",
    author: "Julian",
    title: "Product @ Vercel",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    size: "small" // 1x1
  },
  {
    quote: "Finally, a polling tool that respects the user's intelligence and time. The analytics are surgical.",
    author: "Alex",
    title: "CTO @ Framer",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80",
    size: "wide" // 2x1
  }
]

export function TrustGrid() {
  return (
    <section className="py-48 px-6 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-32 max-w-3xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8"
          >
            Loved by <br />
            <span className="text-primary italic">Creators</span> & <br />
            Craftspeople.
          </motion.h2>
          <p className="text-2xl text-muted-foreground leading-relaxed">
            The standard for high-end opinion capture. Trusted by the world's most design-obsessed teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`relative group rounded-[40px] border border-white/20 bg-white/5 backdrop-blur-3xl p-10 flex flex-col justify-between transition-all hover:translate-y-[-8px] hover:shadow-2xl ${
                review.size === 'large' ? 'lg:col-span-2 lg:row-span-2 md:col-span-2' : 
                review.size === 'wide' ? 'lg:col-span-2 md:col-span-2' : ''
              }`}
            >
              <div className="space-y-8 relative z-10">
                <div className="flex gap-1 text-primary">
                   {[1, 2, 3, 4, 5].map(j => (
                     <Star key={j} className="h-5 w-5 fill-current" />
                   ))}
                </div>
                <blockquote className={`font-bold tracking-tight leading-tight ${
                  review.size === 'large' ? 'text-4xl md:text-5xl' : 'text-2xl'
                }`}>
                  "{review.quote}"
                </blockquote>
              </div>
              
              <div className="pt-12 flex items-center gap-4 relative z-10">
                <img src={review.image} className="h-14 w-14 rounded-full border-2 border-primary/20" alt="" />
                <div>
                  <p className="text-lg font-bold leading-none">{review.author}</p>
                  <p className="text-sm text-muted-foreground font-medium">{review.title}</p>
                </div>
              </div>

              {/* Decorative gradient for large cards */}
              {review.size === 'large' && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -z-10 group-hover:bg-primary/20 transition-colors" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Star({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
