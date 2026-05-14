import { useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DraftQuestion, DraftOption } from "@/hooks/use-poll-draft"

interface QuestionBlockProps {
  question: DraftQuestion
  index: number
  onUpdateQuestion: (id: string, updates: Partial<Omit<DraftQuestion, "id" | "options">>) => void
  onDeleteQuestion: (id: string) => void
  onAddOption: (questionId: string, text: string) => void
  onUpdateOption: (questionId: string, optionId: string, text: string) => void
  onDeleteOption: (questionId: string, optionId: string) => void
}

export function QuestionBlock({
  question,
  index,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
}: QuestionBlockProps) {
  const optionsEndRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, optionIndex: number) => {
    if (e.key === "Enter") {
      e.preventDefault()
      onAddOption(question.id, "")
      setTimeout(() => {
        optionsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }, 50)
    }
  }

  // Ensure there's always at least empty options to type in if zero
  useEffect(() => {
    if (question.options.length === 0) {
      onAddOption(question.id, "")
      onAddOption(question.id, "")
    }
  }, [question.id, question.options.length, onAddOption])

  return (
    <div className="border-2 border-border bg-card p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500 hover:border-primary transition-colors group relative">
      
      {/* Delete Question Button */}
      <button 
        onClick={() => onDeleteQuestion(question.id)}
        className="absolute -top-4 -right-4 bg-destructive text-destructive-foreground border-2 border-border w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="h-5 w-5" />
      </button>

      <div className="flex flex-col gap-6">
        
        {/* Question Input */}
        <div className="flex items-start gap-4">
          <div className="font-heading font-black text-4xl text-muted-foreground pt-2">
            {(index + 1).toString().padStart(2, '0')}
          </div>
          <div className="flex-1 space-y-2">
             <Input
                value={question.text}
                onChange={(e) => onUpdateQuestion(question.id, { text: e.target.value })}
                placeholder="What do you want to ask?"
                className="w-full text-2xl md:text-3xl font-heading font-bold border-0 border-b-2 border-border bg-transparent px-0 rounded-none focus-visible:ring-0 focus-visible:border-primary h-auto py-2 placeholder:opacity-50"
             />
             <div className="flex items-center gap-2 pt-2">
               <Switch 
                 checked={question.isMandatory}
                 onCheckedChange={(checked) => onUpdateQuestion(question.id, { isMandatory: checked })}
                 className="data-[state=checked]:bg-primary h-5 w-9"
               />
               <span className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">Mandatory</span>
             </div>
          </div>
        </div>

        {/* Options List */}
        <div className="pl-14 space-y-3">
          {question.options.map((option, optIdx) => (
            <div key={option.id} className="flex items-center gap-3">
              <div className="h-8 w-8 bg-muted/30 border-2 border-border flex items-center justify-center font-heading font-bold text-sm text-muted-foreground shrink-0">
                {String.fromCharCode(65 + optIdx)}
              </div>
              <Input
                value={option.text}
                onChange={(e) => onUpdateOption(question.id, option.id, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, optIdx)}
                placeholder={`Option ${optIdx + 1}`}
                className="flex-1 bg-muted/10 border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary text-lg h-12"
                autoFocus={option.text === "" && optIdx === question.options.length - 1 && optIdx > 0}
              />
              <button 
                onClick={() => onDeleteOption(question.id, option.id)}
                className="shrink-0 p-2 text-muted-foreground hover:text-destructive transition-colors"
                disabled={question.options.length <= 2}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <div ref={optionsEndRef} />
          
          <Button 
            variant="ghost" 
            onClick={() => onAddOption(question.id, "")}
            className="font-heading font-bold uppercase tracking-wider text-sm mt-2 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Option
          </Button>
        </div>

      </div>
    </div>
  )
}
