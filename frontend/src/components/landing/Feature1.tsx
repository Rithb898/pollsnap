import type { ReactNode } from "react"
import { BentoCard } from "@/components/dashboard/BentoCard"
import { Link2, Sparkles, Zap } from "lucide-react"

interface Feature1Props {
  heading: string
  description: string
  buttons?: Record<string, any>
  customContent?: ReactNode
}

export function Feature1({ heading, description, customContent }: Feature1Props) {
  return (
    <section className="py-24 px-4 relative z-10">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-heading font-black">{heading}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <BentoCard variant="default" className="hover:border-primary/30">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">1. Create Instantly</h3>
            <p className="text-muted-foreground">Type your question and answers. No sign-up required to start polling.</p>
          </BentoCard>
          <BentoCard variant="default" className="hover:border-indigo-500/30">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6">
              <Link2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">2. Share Everywhere</h3>
            <p className="text-muted-foreground">Get a beautiful, unbranded link that embeds perfectly on Twitter, Discord, and Slack.</p>
          </BentoCard>
          <BentoCard variant="default" className="hover:border-emerald-500/30">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">3. Watch it Go Viral</h3>
            <p className="text-muted-foreground">Voters see live confetti and results instantly, creating an irresistible loop.</p>
          </BentoCard>
        </div>

        {customContent}
      </div>
    </section>
  )
}
