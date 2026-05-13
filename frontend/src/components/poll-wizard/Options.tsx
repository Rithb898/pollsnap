import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Check, X, Pencil } from "lucide-react"
import type { DraftQuestion, DraftOption } from "@/hooks/use-poll-draft"

interface OptionsProps {
  questions: DraftQuestion[]
  onAddOption: (questionId: string, text: string) => void
  onUpdateOption: (questionId: string, optionId: string, text: string) => void
  onDeleteOption: (questionId: string, optionId: string) => void
  onNext: () => void
  onBack: () => void
}

export function Options({
  questions,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  onNext,
  onBack,
}: OptionsProps) {
  const [addingToQuestion, setAddingToQuestion] = useState<string | null>(null)
  const [newOptionText, setNewOptionText] = useState("")
  const [editingOption, setEditingOption] = useState<{
    questionId: string
    optionId: string
  } | null>(null)
  const [editText, setEditText] = useState("")

  const handleAddOption = (questionId: string) => {
    if (newOptionText.trim()) {
      onAddOption(questionId, newOptionText.trim())
      setNewOptionText("")
      setAddingToQuestion(null)
    }
  }

  const handleEditStart = (
    questionId: string,
    option: DraftOption
  ) => {
    setEditingOption({ questionId, optionId: option.id })
    setEditText(option.text)
  }

  const handleEditSave = (questionId: string, optionId: string) => {
    if (editText.trim()) {
      onUpdateOption(questionId, optionId, editText.trim())
    }
    setEditingOption(null)
    setEditText("")
  }

  const allQuestionsHaveMinOptions = questions.every(
    (q) => q.options.length >= 2
  )

  const duplicateOptions = questions
    .map((q) => {
      const texts = q.options.map((o) => o.text.toLowerCase())
      const duplicates = texts.filter(
        (text, index) => texts.indexOf(text) !== index
      )
      return { questionId: q.id, duplicates }
    })
    .filter((q) => q.duplicates.length > 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Options</h2>
        <p className="text-muted-foreground">
          Add options for each question. Each question needs at least 2
          options.
        </p>
      </div>

      {questions.length === 0 ? (
        <p className="text-muted-foreground">
          No questions yet. Go back to add questions first.
        </p>
      ) : (
        <Accordion className="space-y-3">
          {questions.map((question, qIndex) => (
            <AccordionItem
              key={question.id}
              value={question.id}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {qIndex + 1}. {question.text}
                  </span>
                  <Badge
                    variant={
                      question.options.length >= 2
                        ? "default"
                        : "secondary"
                    }
                  >
                    {question.options.length} options
                  </Badge>
                  {question.options.length < 2 && (
                    <span className="text-xs text-destructive">
                      Need {2 - question.options.length} more
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-2 p-2 rounded bg-muted/50"
                    >
                      {editingOption?.questionId === question.id &&
                      editingOption?.optionId === option.id ? (
                        <>
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              handleEditSave(question.id, option.id)
                            }
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingOption(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1">
                            {String.fromCharCode(65 + oIndex)}. {option.text}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditStart(question.id, option)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              onDeleteOption(question.id, option.id)
                            }
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}

                  {addingToQuestion === question.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newOptionText}
                        onChange={(e) => setNewOptionText(e.target.value)}
                        placeholder="Enter option text"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddOption(question.id)}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAddingToQuestion(null)
                          setNewOptionText("")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddingToQuestion(question.id)}
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Add Option
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {duplicateOptions.length > 0 && (
        <p className="text-sm text-destructive">
          Duplicate options found. Each option within a question must be
          unique.
        </p>
      )}

      {!allQuestionsHaveMinOptions && (
        <p className="text-sm text-destructive">
          Each question needs at least 2 options to continue
        </p>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!allQuestionsHaveMinOptions || duplicateOptions.length > 0}
        >
          Continue to Review
        </Button>
      </div>
    </div>
  )
}