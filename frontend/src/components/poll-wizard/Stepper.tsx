import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  number: number
  label: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  completedSteps: number[]
  onStepClick?: (step: number) => void
}

export function Stepper({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: StepperProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.number)
        const isCurrent = step.number === currentStep
        const isClickable = isCompleted || step.number <= currentStep

        return (
          <div key={step.number} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => isClickable && onStepClick?.(step.number)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                isCurrent && "bg-primary text-primary-foreground",
                isCompleted && "bg-green-100 text-green-700 hover:bg-green-200",
                !isCurrent &&
                  !isCompleted &&
                  "text-muted-foreground cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                  isCurrent && "bg-white/20 text-white",
                  isCompleted && "bg-green-600 text-white",
                  !isCurrent &&
                    !isCompleted &&
                    "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span className="hidden sm:inline text-sm font-medium">
                {step.label}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2",
                  isCompleted ? "bg-green-600" : "bg-muted"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}