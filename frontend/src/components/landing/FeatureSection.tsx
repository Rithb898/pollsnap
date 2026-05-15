import { BentoCard } from "@/components/dashboard/BentoCard"
import { Check, Clock, Zap, Calendar, Shield } from "lucide-react"

export function FeatureSection() {
  return (
    <section className="py-24 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Enterprise Grade Security</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            PollSnap is built with the highest level of security in mind, ensuring that your data is protected from breaches and unauthorized access.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-8">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-3xl font-bold">Scale to Infinity</h3>
            <p className="text-muted-foreground text-lg">
              PollSnap is built to handle the largest volumes of interactions with ease, ensuring that your business can scale to any size.
            </p>
            <ul className="space-y-4">
              {[
                "Secure Poll Transactions",
                "Instant Result Notifications",
                "Flexible Export Options"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium">
                  <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button className="text-primary font-semibold hover:underline flex items-center gap-2">
              Learn more <Zap className="h-4 w-4" />
            </button>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-transparent blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <BentoCard className="relative p-0 overflow-hidden border-white/20 shadow-2xl">
              <div className="bg-zinc-900 p-6 space-y-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-1/3 bg-white/10 rounded" />
                  <div className="h-20 w-full bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                    <p className="text-xs text-zinc-500 font-mono">Real-time Result Stream...</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-10 bg-primary/20 rounded-lg border border-primary/20" />
                    <div className="h-10 bg-white/5 rounded-lg border border-white/10" />
                    <div className="h-10 bg-white/5 rounded-lg border border-white/10" />
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Clock className="h-6 w-6" />,
              title: "Time Management",
              description: "Effortlessly manage your poll with precision and speed."
            },
            {
              icon: <Zap className="h-6 w-6" />,
              title: "Instant Performance",
              description: "Experience lightning fast processing and results."
            },
            {
              icon: <Calendar className="h-6 w-6" />,
              title: "Schedule Management",
              description: "Organize your polls seamlessly with our integrated calendar."
            }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold">{feature.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
