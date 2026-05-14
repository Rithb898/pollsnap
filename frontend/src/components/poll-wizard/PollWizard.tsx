import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { usePollDraft, type DraftQuestion } from "@/hooks/use-poll-draft"
import { pollsApi, questionsApi, optionsApi, type PollDTO, type QuestionDTO, type OptionDTO, SWR_KEYS } from "@/lib/api"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AlertTriangle, Plus, Settings2, Save, Rocket } from "lucide-react"
import { QuestionBlock } from "./QuestionBlock"

interface PollWizardProps {
  mode: "create" | "edit"
}

export function PollWizard({ mode }: PollWizardProps) {
  const { id: pollId } = useParams()
  const navigate = useNavigate()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // Single central state for questions during edit
  const [localQuestions, setLocalQuestions] = useState<DraftQuestion[]>([])
  const [serverQuestionsMap, setServerQuestionsMap] = useState<Map<string, QuestionDTO>>(new Map())
  
  const {
    draft,
    updateBasicInfo,
    setPollId,
    clearStorage,
  } = usePollDraft(pollId)

  // Initialization & Data Loading
  useEffect(() => {
    if (mode === "edit" && pollId) {
      const load = async () => {
        setIsLoading(true)
        try {
          const poll = await pollsApi.get(pollId) as PollDTO
          if (poll.status !== "draft") {
            toast.error("Can only edit draft polls")
            navigate("/dashboard")
            return
          }
          
          updateBasicInfo({
            title: poll.title,
            description: poll.description || "",
            isAnonymous: poll.isAnonymous,
            expiresAt: poll.expiresAt || null,
            responseGoal: poll.responseGoal || null,
          })
          setPollId(pollId)
          
          const questions = await questionsApi.list(pollId) as QuestionDTO[]
          const map = new Map<string, QuestionDTO>()
          questions.forEach(q => map.set(q.id, q))
          setServerQuestionsMap(map)
          
          setLocalQuestions(questions.map(q => ({
            id: q.id,
            text: q.text,
            isMandatory: q.isMandatory,
            options: q.options.map((o: OptionDTO) => ({ id: o.id, text: o.text })),
          })))
        } catch {
          toast.error("Failed to load poll")
          navigate("/dashboard")
        } finally {
          setIsLoading(false)
        }
      }
      load()
    } else if (mode === "create") {
      // In create mode, if we have draft questions, use them. Otherwise, initialize one empty question out of the gate.
      if (draft.questions && draft.questions.length > 0) {
        setLocalQuestions(draft.questions)
      } else {
        setLocalQuestions([{
          id: `temp_${Date.now()}`,
          text: "",
          isMandatory: true,
          options: [
            { id: `temp_opt1_${Date.now()}`, text: "" },
            { id: `temp_opt2_${Date.now()}`, text: "" }
          ]
        }])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, pollId])

  // Question Mutators
  const handleAddQuestion = () => {
    setLocalQuestions(prev => [
      ...prev,
      {
        id: `temp_${Date.now()}`,
        text: "",
        isMandatory: true,
        options: [
          { id: `temp_opt1_${Date.now()}`, text: "" },
          { id: `temp_opt2_${Date.now()}`, text: "" }
        ]
      }
    ])
  }

  const handleUpdateQuestion = (qId: string, updates: Partial<Omit<DraftQuestion, "id" | "options">>) => {
    setLocalQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...updates } : q))
  }

  const handleDeleteQuestion = (qId: string) => {
    setLocalQuestions(prev => prev.filter(q => q.id !== qId))
  }

  const handleAddOption = (qId: string, text: string) => {
    setLocalQuestions(prev => prev.map(q => 
      q.id === qId ? { ...q, options: [...q.options, { id: `temp_${Date.now()}_${Math.random().toString(36).substr(2)}`, text }] } : q
    ))
  }

  const handleUpdateOption = (qId: string, oId: string, text: string) => {
    setLocalQuestions(prev => prev.map(q => 
      q.id === qId ? { ...q, options: q.options.map(o => o.id === oId ? { ...o, text } : o) } : q
    ))
  }

  const handleDeleteOption = (qId: string, oId: string) => {
    setLocalQuestions(prev => prev.map(q => 
      q.id === qId ? { ...q, options: q.options.filter(o => o.id !== oId) } : q
    ))
  }

  // Save Logic
  const performSave = async (): Promise<string | null> => {
    if (!draft.basicInfo.title.trim()) {
      toast.error("Title is required")
      return null
    }

    try {
      setIsSaving(true)
      let currentPollId = pollId

      // 1. Create or Update basic poll info
      if (!currentPollId) {
        const result = await pollsApi.create({
          title: draft.basicInfo.title,
          description: draft.basicInfo.description,
          isAnonymous: draft.basicInfo.isAnonymous,
          expiresAt: draft.basicInfo.expiresAt || undefined,
          responseGoal: draft.basicInfo.responseGoal || undefined,
        })
        currentPollId = result.id
        setPollId(result.id)
      } else {
        await pollsApi.update(currentPollId, {
          title: draft.basicInfo.title,
          description: draft.basicInfo.description,
          isAnonymous: draft.basicInfo.isAnonymous,
          expiresAt: draft.basicInfo.expiresAt || undefined,
          responseGoal: draft.basicInfo.responseGoal || undefined,
        })
      }

      // 2. Sync Questions and Options
      for (const question of localQuestions) {
        const hasText = question.text.trim().length > 0;
        const validOptions = question.options.filter(o => o.text.trim().length > 0);
        
        // Skip entirely empty questions
        if (!hasText && validOptions.length === 0) continue;

        if (question.id.startsWith("temp_")) {
          // New question
          const createdQ = await questionsApi.create(currentPollId, {
            text: question.text.trim() || "Untitled Question",
            isMandatory: question.isMandatory,
          })
          
          for (const option of validOptions) {
            await optionsApi.create(currentPollId, createdQ.id, { text: option.text.trim() })
          }
        } else {
          // Existing question update
          const existing = serverQuestionsMap.get(question.id)
          if (existing && (existing.text !== question.text || existing.isMandatory !== question.isMandatory)) {
            await questionsApi.update(currentPollId, question.id, {
              text: question.text,
              isMandatory: question.isMandatory,
            })
          }
          
          const existingOptionTexts = existing?.options.map((o) => o.text) || []
          const currentOptionTexts = validOptions.map((o) => o.text)
          
          for (const option of validOptions) {
            if (option.id.startsWith("temp_")) {
              await optionsApi.create(currentPollId, question.id, { text: option.text })
            } else if (!existingOptionTexts.includes(option.text)) {
              await optionsApi.create(currentPollId, question.id, { text: option.text })
            }
          }
          
          const optionsToDelete = existing?.options.filter(
            (o) => !currentOptionTexts.includes(o.text)
          ) || []
          
          for (const opt of optionsToDelete) {
            await optionsApi.delete(currentPollId, question.id, opt.id)
          }
        }
      }
      
      // 3. Delete removed questions
      const questionsToDelete = Array.from(serverQuestionsMap.values()).filter(
        (sq) => !localQuestions.find((cq) => cq.id === sq.id)
      )
      for (const q of questionsToDelete) {
        await questionsApi.delete(currentPollId!, q.id)
      }

      await mutate(SWR_KEYS.polls())
      return currentPollId
    } catch {
      toast.error("Failed to save draft")
      return null
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveDraft = async () => {
    const id = await performSave()
    if (id) {
      toast.success("Draft saved")
      if (mode === "create") {
         navigate(`/poll/${id}/edit`)
      }
    }
  }

  const handleActivate = async () => {
    setIsActivating(true)
    const id = await performSave()
    if (id) {
      try {
        await pollsApi.activate(id)
        await mutate(SWR_KEYS.polls())
        toast.success("Poll activated and ready for responses!")
        clearStorage()
        navigate(`/poll/${id}`)
      } catch {
        toast.error("Failed to activate poll")
      }
    }
    setIsActivating(false)
  }

  if (isLoading) {
    return <div className="text-center font-heading font-black text-4xl animate-pulse py-24">LOADING CANVAS...</div>
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Title & Desc */}
      <div className="space-y-6">
        <Input 
          className="text-4xl md:text-5xl lg:text-6xl font-heading font-black h-auto border-0 border-b-4 border-border rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-primary placeholder:opacity-30 bg-transparent transition-colors"
          placeholder="POLL TITLE"
          value={draft.basicInfo.title}
          onChange={(e) => updateBasicInfo({ title: e.target.value })}
        />
        <Textarea 
          className="text-xl md:text-2xl font-heading font-bold min-h-[100px] border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary placeholder:opacity-30 bg-card p-6 shadow-[4px_4px_0px_0px_#09090b] dark:shadow-[4px_4px_0px_0px_#ffffff]"
          placeholder="Add an optional description or context for your respondents..."
          value={draft.basicInfo.description}
          onChange={(e) => updateBasicInfo({ description: e.target.value })}
        />
      </div>

      {/* Questions Canvas */}
      <div className="space-y-8">
        {localQuestions.map((q, i) => (
          <QuestionBlock 
            key={q.id}
            question={q}
            index={i}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onAddOption={handleAddOption}
            onUpdateOption={handleUpdateOption}
            onDeleteOption={handleDeleteOption}
          />
        ))}
        
        <Button 
          onClick={handleAddQuestion}
          variant="outline"
          className="w-full h-24 border-4 border-dashed border-border bg-transparent hover:bg-muted font-heading font-black uppercase text-2xl tracking-widest transition-all"
        >
          <Plus className="mr-3 h-8 w-8" />
          Add Question
        </Button>
      </div>

      {/* Settings Block */}
      <div className="bg-muted/30 border-2 border-border p-6 shadow-[4px_4px_0px_0px_#09090b] dark:shadow-[4px_4px_0px_0px_#ffffff]">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-between w-full font-heading font-black text-2xl uppercase tracking-wider text-left"
        >
          <div className="flex items-center gap-3">
            <Settings2 className="h-6 w-6" />
            Advanced Settings
          </div>
          <span className="text-primary text-4xl">{showSettings ? "-" : "+"}</span>
        </button>
        
        {showSettings && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-start gap-4">
              <Switch 
                checked={draft.basicInfo.isAnonymous}
                onCheckedChange={(c) => updateBasicInfo({ isAnonymous: c })}
                className="mt-1"
              />
              <div>
                <h4 className="font-heading font-bold text-xl uppercase">Anonymous Responses</h4>
                <p className="text-muted-foreground font-medium mt-1">Don't collect respondent identities. Useful for sensitive feedback.</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-heading font-bold text-xl uppercase">Response Goal</h4>
              <Input 
                type="number"
                placeholder="e.g. 100"
                value={draft.basicInfo.responseGoal || ""}
                onChange={(e) => updateBasicInfo({ responseGoal: e.target.value ? parseInt(e.target.value) : null })}
                className="h-14 text-xl font-bold border-2 border-border bg-card"
              />
              <p className="text-muted-foreground font-medium text-sm">Automatically track progress towards a target number of responses.</p>
            </div>
            
            <div className="space-y-3 md:col-span-2">
              <h4 className="font-heading font-bold text-xl uppercase">Expiry Date</h4>
              <Input 
                type="datetime-local"
                value={draft.basicInfo.expiresAt ? new Date(draft.basicInfo.expiresAt).toISOString().slice(0, 16) : ""}
                onChange={(e) => updateBasicInfo({ expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                className="h-14 text-xl font-bold border-2 border-border bg-card"
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t-4 border-border flex items-center justify-between z-50 animate-in slide-in-from-bottom-full duration-500 delay-300">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between px-4 md:px-0">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span className="font-heading font-bold text-sm tracking-widest uppercase hidden md:inline-block">
              {localQuestions.length} Questions • Draft Mode
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
               variant="outline" 
               size="lg" 
               className="font-heading font-black uppercase tracking-wider h-14 px-8 border-2 border-border hidden md:flex hover:bg-muted"
               onClick={handleSaveDraft}
               disabled={isSaving || isActivating}
            >
              <Save className="mr-2 h-5 w-5" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button 
               size="lg" 
               className="font-heading font-black uppercase tracking-wider h-14 px-8 border-2 border-primary hover:scale-105 transition-transform"
               onClick={handleActivate}
               disabled={isSaving || isActivating || localQuestions.length === 0}
            >
              <Rocket className="mr-2 h-5 w-5" />
              {isActivating ? "Activating..." : "Activate Poll"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
