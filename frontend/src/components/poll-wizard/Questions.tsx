import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Edit2, Check, X } from "lucide-react"
import type { DraftQuestion } from "@/hooks/use-poll-draft"

interface QuestionsProps {
  questions: DraftQuestion[]
  onAddQuestion: (text: string, isMandatory: boolean) => void
  onUpdateQuestion: (
    questionId: string,
    updates: Partial<Omit<DraftQuestion, "id" | "options">>
  ) => void
  onDeleteQuestion: (questionId: string) => void
  onNext: () => void
  onBack: () => void
}

export function Questions({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onNext,
  onBack,
}: QuestionsProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newQuestionText, setNewQuestionText] = useState("")
  const [newQuestionMandatory, setNewQuestionMandatory] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")

  const handleAdd = () => {
    if (newQuestionText.trim()) {
      onAddQuestion(newQuestionText.trim(), newQuestionMandatory)
      setNewQuestionText("")
      setNewQuestionMandatory(true)
      setIsAdding(false)
    }
  }

  const handleEditStart = (question: DraftQuestion) => {
    setEditingId(question.id)
    setEditText(question.text)
  }

  const handleEditSave = (questionId: string) => {
    if (editText.trim()) {
      onUpdateQuestion(questionId, { text: editText.trim() })
    }
    setEditingId(null)
    setEditText("")
  }

  const canProceed = questions.length >= 1

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Questions</h2>
        <p className="text-muted-foreground">
          Add questions to your poll. You need at least 1 question.
        </p>
      </div>

      {questions.length > 0 && (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="py-4">
                {editingId === question.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditSave(question.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{index + 1}.</span>
                        <span>{question.text}</span>
                        {question.isMandatory && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {question.options.length} options
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditStart(question)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDeleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isAdding ? (
        <Card>
          <CardContent className="py-4 space-y-4">
            <Input
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="Enter your question"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="mandatory"
                checked={newQuestionMandatory}
                onCheckedChange={(checked) =>
                  setNewQuestionMandatory(checked as boolean)
                }
              />
              <label htmlFor="mandatory" className="text-sm">
                This question is required
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm">
                Add Question
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(false)
                  setNewQuestionText("")
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      )}

      {!canProceed && (
        <p className="text-sm text-destructive">
          You need at least 1 question to continue
        </p>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Continue to Options
        </Button>
      </div>
    </div>
  )
}