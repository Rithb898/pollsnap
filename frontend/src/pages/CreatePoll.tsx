import { PollWizard } from "@/components/poll-wizard"
import { Link } from "react-router"

export default function CreatePoll() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between border-b-2 border-border pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-black uppercase tracking-tight">Create Poll</h1>
            <p className="text-muted-foreground text-lg font-medium mt-1">Configure your poll settings and questions.</p>
          </div>
          <Link to="/dashboard" className="font-heading font-bold uppercase hover:text-primary transition-colors">
            Cancel
          </Link>
        </div>

        <div className="bg-card border-2 border-border p-8 md:p-12 shadow-[8px_8px_0px_0px_#09090b] dark:shadow-[8px_8px_0px_0px_#ffffff]">
          <PollWizard mode="create" />
        </div>
      </div>
    </div>
  )
}