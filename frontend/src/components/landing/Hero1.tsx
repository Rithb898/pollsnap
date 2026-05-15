import type { ReactNode } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"

interface Hero1Props {
  heading: string
  description: string
  badge?: { text: string }
  buttons?: {
    primary?: { text: string; url: string }
    secondary?: { text: string; url: string }
  }
  customContent?: ReactNode
}

export function Hero1({ heading, description, badge, buttons, customContent }: Hero1Props) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
      {/* Grid Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.15] dark:opacity-[0.1]"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--border) 1px, transparent 1px),
              linear-gradient(to bottom, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black 0%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 80%)'
          }}
        />
        {/* Glow effect */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          {badge && (
            <div className="mb-8 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm transition-all hover:bg-primary/10">
              {badge.text}
            </div>
          )}
          
          <h1 className="mb-6 max-w-5xl text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl leading-[1.1]">
            {heading}
          </h1>
          
          <p className="mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {description}
          </p>
          
          <div className="flex flex-col items-center gap-4">
            {buttons?.primary && (
              <Button size="lg" render={<Link to={buttons.primary.url} />} className="h-14 rounded-full px-10 text-lg font-semibold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                {buttons.primary.text}
              </Button>
            )}
            <p className="text-sm text-muted-foreground">
              No credit card required!
            </p>
          </div>

          {customContent && (
            <div className="mt-20 w-full">
              {customContent}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
