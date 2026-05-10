import { Link } from "react-router"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
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
    <div>
      <section className="container  flex flex-col items-center justify-center gap-4 py-24 text-center md:py-32">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Create polls that people{" "}
          <span className="text-primary">actually vote on</span>
        </h1>
        <p className="max-w-175 text-lg text-muted-foreground">
          PollSnap makes it easy to create beautiful polls, share them anywhere,
          and watch results pour in with real-time analytics. No signup required
          for voters.
        </p>
        <div className="flex gap-4">
          {isAuthenticated ? (
            <Button size="lg" render={<Link to="/dashboard" />}>
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button size="lg" render={<Link to="/register" />}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" render={<Link to="/login" />}>
                Sign In
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="container py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary" />
                <CardTitle className="mt-4">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-12">
        <div className="flex flex-col items-center gap-8 rounded-2xl bg-muted p-8 text-center md:p-12">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="max-w-125 text-muted-foreground">
            Create your first poll in under a minute. No credit card required.
          </p>
          <Button size="lg" render={<Link to={isAuthenticated ? "/polls/new" : "/register"} />}>
            Create Your First Poll
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  )
}
