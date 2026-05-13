import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { DraftPoll } from "@/hooks/use-poll-draft"

interface ReviewProps {
  draft: DraftPoll
  onSaveDraft: () => void
  onActivate: () => void
  onBack: () => void
  isSaving: boolean
  isActivating: boolean
  error?: string
}

interface ValidationItem {
  label: string
  valid: boolean
}

export function Review({
  draft,
  onSaveDraft,
  onActivate,
  onBack,
  isSaving,
  isActivating,
  error,
}: ReviewProps) {
  const validations: ValidationItem[] = [
    {
      label: "Title is present",
      valid: draft.basicInfo.title.trim().length > 0,
    },
    {
      label: "Expiry date is set",
      valid: !!draft.basicInfo.expiresAt,
    },
    {
      label: "At least 1 question",
      valid: draft.questions.length >= 1,
    },
    {
      label: "Each question has 2+ options",
      valid: draft.questions.every((q) => q.options.length >= 2),
    },
  ]

  const isValid = validations.every((v) => v.valid)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review & Activate</h2>
        <p className="text-muted-foreground">
          Review your poll and activate it when ready
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {draft.basicInfo.title || "Untitled Poll"}
            <Badge variant="secondary">Draft</Badge>
          </CardTitle>
          {draft.basicInfo.description && (
            <p className="text-muted-foreground">
              {draft.basicInfo.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Anonymous: </span>
              <span>{draft.basicInfo.isAnonymous ? "Yes" : "No"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Expires: </span>
              <span>
                {draft.basicInfo.expiresAt
                  ? format(new Date(draft.basicInfo.expiresAt), "PPP p")
                  : "Not set"}
              </span>
            </div>
            {draft.basicInfo.responseGoal && (
              <div>
                <span className="text-muted-foreground">Goal: </span>
                <span>{draft.basicInfo.responseGoal} responses</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {draft.questions.map((question, qIndex) => (
              <div
                key={question.id}
                className="p-4 rounded-lg bg-muted/50 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {qIndex + 1}. {question.text}
                  </span>
                  {question.isMandatory && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                <ul className="ml-6 space-y-1">
                  {question.options.map((option, oIndex) => (
                    <li key={option.id} className="text-sm text-muted-foreground">
                      {String.fromCharCode(65 + oIndex)}. {option.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Validation Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {validations.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                {item.valid ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    item.valid ? "text-foreground" : "text-destructive"
                  )}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onSaveDraft}
            disabled={isSaving || isActivating}
          >
            {isSaving ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            onClick={onActivate}
            disabled={!isValid || isSaving || isActivating}
          >
            {isActivating ? "Activating..." : "Activate Poll"}
          </Button>
        </div>
      </div>
    </div>
  )
}