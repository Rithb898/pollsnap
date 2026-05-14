import { Link } from "react-router"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, Link2, Zap, ArrowRight } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Watch votes come in live with beautiful charts and instant updates.",
  },
  {
    icon: Link2,
    title: "Share Anywhere",
    description:
      "Generate public links to share your polls on social media, email, or anywhere.",
  },
  {
    icon: Users,
    title: "No Account Required",
    description:
      "Voters don't need an account. Just share the link and collect responses.",
  },
  {
    icon: Zap,
    title: "Quick Setup",
    description:
      "Create polls in seconds with our intuitive interface. No learning curve.",
  },
]

export default function Home() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="animate-in fade-in duration-1000">
      <section className="container flex flex-col items-center justify-center gap-8 py-24 md:py-32 text-center border-b-2 border-border mb-12">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-black tracking-tighter uppercase leading-[0.85] animate-in slide-in-from-bottom-12 duration-700">
          Poll <br className="md:hidden" />
          <span className="text-primary block md:inline border-b-[8px] md:border-b-[16px] border-primary pb-2 md:pb-4 mt-2 md:mt-0">Faster.</span>
        </h1>
        <p className="max-w-2xl text-xl md:text-2xl font-medium text-muted-foreground mt-8 animate-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          PollSnap makes it easy to create brutally fast polls, share them anywhere, and watch results pour in with real-time analytics. No signup required for voters.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 mt-8 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          {isAuthenticated ? (
            <Button size="lg" className="h-16 px-10 text-xl font-heading uppercase tracking-widest font-black rounded-none border-2 border-border hover:-translate-y-2 transition-transform shadow-[4px_4px_0px_0px_var(--color-primary)]" render={<Link to="/dashboard" />}>
              Dashboard
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          ) : (
            <>
              <Button size="lg" className="h-16 px-10 text-xl font-heading uppercase tracking-widest font-black rounded-none border-2 border-border hover:-translate-y-2 transition-transform shadow-[4px_4px_0px_0px_var(--color-primary)]" render={<Link to="/register" />}>
                Get Started
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-heading uppercase tracking-widest font-black rounded-none border-2 border-border hover:bg-muted" render={<Link to="/login" />}>
                Sign In
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="container py-12 mb-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <div 
              key={feature.title} 
              className="border-2 border-border p-8 bg-card flex flex-col animate-in slide-in-from-bottom-8 duration-700 fill-mode-both hover:-translate-y-2 transition-transform hover:border-primary"
              style={{ animationDelay: `${400 + i * 150}ms` }}
            >
              <feature.icon className="h-12 w-12 text-primary mb-6" strokeWidth={1.5} />
              <h3 className="text-2xl font-bold font-heading uppercase tracking-wide mb-3">{feature.title}</h3>
              <p className="text-muted-foreground font-medium text-lg leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-24 mb-12">
        <div className="flex flex-col items-center gap-10 bg-primary text-primary-foreground border-2 border-border p-12 md:p-24 text-center">
          <h2 className="text-5xl md:text-7xl font-black font-heading uppercase tracking-tighter">Ready to ask?</h2>
          <p className="max-w-xl text-2xl font-medium opacity-90">
            Create your first poll in under 30 seconds. No credit card required.
          </p>
          <Button 
            size="lg" 
            variant="outline" 
            className="mt-4 h-16 px-12 text-xl font-heading uppercase tracking-widest font-black rounded-none border-2 border-primary-foreground hover:bg-primary-foreground hover:text-primary transition-colors"
            render={<Link to={isAuthenticated ? "/polls/new" : "/register"} />}
          >
            Create Your First Poll
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
        </div>
      </section>
    </div>
  )
}
