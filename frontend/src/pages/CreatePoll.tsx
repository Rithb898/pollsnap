import { PollWizard } from "@/components/poll-wizard"
import { Link } from "react-router"
import { ArrowLeft } from "lucide-react"

export default function CreatePoll() {
  return (
    <div className="container space-y-8 mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight">Poll Builder</h1>
          <p className="text-muted-foreground mt-1">Design your poll and configure its settings.</p>
        </div>
      </div>

      <PollWizard mode="create" />
    </div>
  )
}