import { useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus, CheckCircle2 } from "lucide-react"
import { BentoCard } from "@/components/dashboard/BentoCard"
import type { DraftQuestion } from "@/hooks/use-poll-draft"

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, _optionIndex: number) => {
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
    <BentoCard className="p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500 group relative border-border/50 bg-card hover:border-primary/30 transition-colors shadow-sm">
      
      {/* Delete Question Button */}
      <Button 
        variant="ghost"
        size="sm"
        onClick={() => onDeleteQuestion(question.id)}
        className="absolute top-4 right-4 text-muted-foreground hover:text-destructive p-2 rounded-full hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
        title="Delete Question"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="flex flex-col gap-8">
        
        {/* Question Header & Input */}
        <div className="flex items-start gap-4 pr-8">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 mt-1">
            {index + 1}
          </div>
          <div className="flex-1 space-y-3">
             <Input
                value={question.text}
                onChange={(e) => onUpdateQuestion(question.id, { text: e.target.value })}
                placeholder="Type your question here..."
                className="w-full text-xl md:text-2xl font-bold border-0 border-b border-border bg-transparent px-0 rounded-none focus-visible:ring-0 focus-visible:border-primary h-auto pb-2 placeholder:opacity-30 shadow-none"
             />
             <div className="flex items-center gap-2">
               <Switch 
                 checked={question.isMandatory}
                 onCheckedChange={(checked) => onUpdateQuestion(question.id, { isMandatory: checked })}
                 className="data-[state=checked]:bg-primary scale-75 origin-left"
               />
               <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                 {question.isMandatory ? <span className="text-primary flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Required</span> : "Optional"}
               </span>
             </div>
          </div>
        </div>

        {/* Options List */}
        <div className="pl-12 space-y-3">
          {question.options.map((option, optIdx) => (
            <div key={option.id} className="flex items-center gap-3 group/option">
              <div className="h-6 w-6 rounded flex items-center justify-center font-bold text-xs text-muted-foreground bg-muted shrink-0 group-focus-within/option:bg-primary/10 group-focus-within/option:text-primary transition-colors">
                {String.fromCharCode(65 + optIdx)}
              </div>
              <Input
                value={option.text}
                onChange={(e) => onUpdateOption(question.id, option.id, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, optIdx)}
                placeholder={`Option ${optIdx + 1}`}
                className="flex-1 bg-background border-border/50 focus-visible:ring-1 focus-visible:ring-primary shadow-sm h-10 transition-all"
                autoFocus={option.text === "" && optIdx === question.options.length - 1 && optIdx > 0}
              />
              <button 
                onClick={() => onDeleteOption(question.id, option.id)}
                className="shrink-0 p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover/option:opacity-100 transition-opacity disabled:opacity-0"
                disabled={question.options.length <= 2}
                tabIndex={-1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div ref={optionsEndRef} />
          
          <Button 
            variant="ghost" 
            onClick={() => onAddOption(question.id, "")}
            className="text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 mt-2 px-3 h-8"
          >
            <Plus className="h-3 w-3 mr-1.5" /> Add Option
          </Button>
        </div>

      </div>
    </BentoCard>
  )
}
