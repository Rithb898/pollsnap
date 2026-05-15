import { motion } from "motion/react"
import { Plus } from "lucide-react"
import { useState } from "react"

const FAQS = [
  {
    q: "Is it really unbranded?",
    a: "Yes. PollSnap was built for craftspeople. We don't plaster our logo on your voice. Your link looks like it was custom-built for you."
  },
  {
    q: "How fast is the results reveal?",
    a: "Sub-millisecond. Our live-sync architecture ensures that as soon as a vote is cast, every observer sees the results update in real-time."
  },
  {
    q: "Can I embed polls in my own app?",
    a: "Absolutely. We provide a clean iframe and a headless SDK for developers who want to integrate our liquid flows directly into their platforms."
  },
  {
    q: "What about data security?",
    a: "Enterprise-grade. We use encrypted transit and storage, with strict anonymity controls so you can capture honest opinions safely."
  }
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-48 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">Common <span className="text-primary italic">Inquiries</span></h2>
        </div>

        <div className="space-y-6">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden"
            >
              <button 
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-8 text-left group"
              >
                <span className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">{faq.q}</span>
                <div className={`h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center transition-transform duration-500 ${open === i ? 'rotate-45 text-primary' : ''}`}>
                  <Plus className="h-6 w-6" />
                </div>
              </button>
              
              <motion.div
                initial={false}
                animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="px-8 pb-8 text-xl text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
