import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Field, FieldLabel, FieldGroup, FieldError } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { addDays, addHours, isAfter, startOfHour } from "date-fns"
import { cn } from "@/lib/utils"
import type { DraftBasicInfo } from "@/hooks/use-poll-draft"

interface BasicInfoProps {
  basicInfo: DraftBasicInfo
  onUpdate: (info: Partial<DraftBasicInfo>) => void
  onNext: () => void
  errors?: Record<string, string>
}

const expiryPresets = [
  { label: "1 day", value: 1 },
  { label: "3 days", value: 3 },
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
]

function getPresetValue(expiresAt: string | null): string {
  if (!expiresAt) return ""
  const diffMs = new Date(expiresAt).getTime() - Date.now()
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (days > 0 && days <= 1) return "1"
  if (days > 1 && days <= 3) return "3"
  if (days > 3 && days <= 7) return "7"
  if (days > 7 && days <= 14) return "14"
  if (days > 14 && days <= 30) return "30"
  return "custom"
}

export function BasicInfo({
  basicInfo,
  onUpdate,
  onNext,
  errors = {},
}: BasicInfoProps) {
  const [showCustomDate, setShowCustomDate] = useState(false)
  const minDate = startOfHour(addHours(new Date(), 1))

  const handlePresetChange = (value: string) => {
    if (value === "custom") {
      setShowCustomDate(true)
      onUpdate({ expiresAt: null })
    } else if (value === "") {
      setShowCustomDate(false)
      onUpdate({ expiresAt: null })
    } else {
      setShowCustomDate(false)
      const days = parseInt(value, 10)
      const expiresAt = addDays(new Date(), days).toISOString()
      onUpdate({ expiresAt })
    }
  }

  const handleCustomDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      const date = new Date(value)
      if (isAfter(date, minDate)) {
        onUpdate({ expiresAt: date.toISOString() })
      }
    }
  }

  const canProceed = basicInfo.title.trim().length > 0

  const currentPreset = showCustomDate ? "custom" : getPresetValue(basicInfo.expiresAt)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Basic Information</h2>
        <p className="text-muted-foreground">
          Set up the basic details for your poll
        </p>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel>
            Title <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            value={basicInfo.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="What's your poll question?"
            maxLength={255}
          />
          {errors.title && <FieldError>{errors.title}</FieldError>}
        </Field>

        <Field>
          <FieldLabel>Description (optional)</FieldLabel>
          <Textarea
            value={basicInfo.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Add more context to your poll"
            maxLength={1000}
            rows={3}
          />
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel className="m-0">Anonymous Responses</FieldLabel>
            <Switch
              checked={basicInfo.isAnonymous}
              onCheckedChange={(checked) => onUpdate({ isAnonymous: checked })}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            When enabled, voter identities are hidden in results
          </p>
        </Field>

        <Field>
          <FieldLabel>Expiry Date</FieldLabel>
          <select
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            )}
            value={currentPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
          >
            <option value="">Select expiry</option>
            {expiryPresets.map((preset) => (
              <option key={preset.value} value={preset.value.toString()}>
                {preset.label}
              </option>
            ))}
            <option value="custom">Custom date</option>
          </select>
        </Field>

        {showCustomDate && (
          <Field>
            <FieldLabel>Custom Expiry</FieldLabel>
            <Input
              type="datetime-local"
              value={basicInfo.expiresAt ? basicInfo.expiresAt.slice(0, 16) : ""}
              onChange={handleCustomDateInput}
              min={minDate.toISOString().slice(0, 16)}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Minimum: 1 hour from now
            </p>
          </Field>
        )}

        <Field>
          <FieldLabel>Response Goal (optional)</FieldLabel>
          <Input
            type="number"
            value={basicInfo.responseGoal ?? ""}
            onChange={(e) =>
              onUpdate({
                responseGoal: e.target.value
                  ? parseInt(e.target.value, 10)
                  : null,
              })
            }
            placeholder="e.g., 100"
            min={1}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Set a target number of responses
          </p>
        </Field>
      </FieldGroup>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canProceed}>
          Continue to Questions
        </Button>
      </div>
    </div>
  )
}