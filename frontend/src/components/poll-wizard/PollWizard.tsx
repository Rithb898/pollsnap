import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { z } from "zod"
import { usePollDraft, type DraftQuestion } from "@/hooks/use-poll-draft"
import { pollsApi, questionsApi, optionsApi, type PollDTO, type QuestionDTO, type OptionDTO, SWR_KEYS } from "@/lib/api"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AlertTriangle, Plus, Save, Rocket, Settings2, Hash, Calendar, ShieldAlert } from "lucide-react"
import { QuestionBlock } from "./QuestionBlock"
import { BentoCard } from "@/components/dashboard/BentoCard"
import { FieldError } from "@/components/ui/field"
import { cn } from "@/lib/utils"

interface PollWizardProps {
  mode: "create" | "edit"
}

const pollBasicInfoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  description: z.string().max(1000, "Description must be 1000 characters or less"),
  isAnonymous: z.boolean(),
  expiresAt: z
    .string()
    .datetime({ message: "Expiry date must be a valid ISO 8601 datetime" })
    .nullable(),
  responseGoal: z.number().int().positive("Response goal must be positive").nullable(),
})

const activateBasicInfoSchema = pollBasicInfoSchema.superRefine((data, ctx) => {
  if (!data.expiresAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["expiresAt"],
      message: "Expiry date is required to activate this poll",
    })
  }
})

type BasicInfoErrors = Partial<Record<"title" | "expiresAt" | "responseGoal", string>>

export function PollWizard({ mode }: PollWizardProps) {
  const { pollId: routePollId, id: legacyPollId } = useParams()
  const pollId = routePollId || legacyPollId
  const navigate = useNavigate()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [basicInfoErrors, setBasicInfoErrors] = useState<BasicInfoErrors>({})
  
  // Single central state for questions during edit
  const [localQuestions, setLocalQuestions] = useState<DraftQuestion[]>([])
  const [serverQuestionsMap, setServerQuestionsMap] = useState<Map<string, QuestionDTO>>(new Map())
  
  const {
    draft,
    updateBasicInfo,
    setPollId,
    clearStorage,
  } = usePollDraft(pollId)

  const clearBasicInfoError = (field: keyof BasicInfoErrors) => {
    setBasicInfoErrors(prev => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error
    ) {
      const candidate = (error as {
        response?: { data?: { message?: unknown } }
      }).response?.data?.message
      if (typeof candidate === "string") {
        return candidate
      }
    }

    if (error instanceof Error && error.message) {
      return error.message
    }

    return fallback
  }

  const validateBasicInfo = (mode: "draft" | "activate") => {
    const schema = mode === "activate" ? activateBasicInfoSchema : pollBasicInfoSchema
    const result = schema.safeParse({
      title: draft.basicInfo.title,
      description: draft.basicInfo.description || "",
      isAnonymous: draft.basicInfo.isAnonymous,
      expiresAt: draft.basicInfo.expiresAt,
      responseGoal: draft.basicInfo.responseGoal,
    })

    if (result.success) {
      setBasicInfoErrors({})
      return true
    }

    const nextErrors: BasicInfoErrors = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0]
      if (field === "title" || field === "expiresAt" || field === "responseGoal") {
        nextErrors[field] = issue.message
      }
    }

    setBasicInfoErrors(nextErrors)
    return false
  }

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
      const nextQuestions = draft.questions && draft.questions.length > 0
        ? draft.questions
        : [{
            id: `temp_${Date.now()}`,
            text: "",
            isMandatory: true,
            options: [
              { id: `temp_opt1_${Date.now()}`, text: "" },
              { id: `temp_opt2_${Date.now()}`, text: "" }
            ]
          }]

      const syncTimer = window.setTimeout(() => {
        setLocalQuestions(nextQuestions)
      }, 0)

      return () => window.clearTimeout(syncTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, pollId, draft.questions])

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
    if (!validateBasicInfo("draft")) {
      toast.error("Fix the highlighted fields")
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
        const normalizedOptionTexts = validOptions.map(o => o.text.trim().toLowerCase())
        const duplicateOption = normalizedOptionTexts.find(
          (text, index) => normalizedOptionTexts.indexOf(text) !== index
        )

        if (duplicateOption) {
          throw new Error("Option text must be unique within a question")
        }
        
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
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save draft"))
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
         navigate(`/polls/${id}/edit`)
      }
    }
  }

  const handleActivate = async () => {
    if (!validateBasicInfo("activate")) {
      toast.error("Fix the highlighted fields")
      return
    }

    setIsActivating(true)
    const id = await performSave()
    if (id) {
      try {
        await pollsApi.activate(id)
        await mutate(SWR_KEYS.polls())
        toast.success("Poll activated and ready for responses!")
        clearStorage()
        navigate(`/poll/${id}`)
      } catch (error: unknown) {
        const message = getErrorMessage(error, "Failed to activate poll")
        if (message.toLowerCase().includes("expiry date")) {
          setBasicInfoErrors(prev => ({
            ...prev,
            expiresAt: message,
          }))
        }
        toast.error(message)
      }
    }
    setIsActivating(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground font-medium animate-pulse">Loading canvas...</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Settings Panel */}
        <div className="xl:col-span-4 space-y-6 sticky top-24">
          <BentoCard className="p-5">
            <h2 className="text-lg font-bold font-heading uppercase tracking-widest mb-4 flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              Meta Data
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Poll Title</label>
                <Input 
                  className="text-lg font-bold h-12 bg-muted/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary"
                  placeholder="e.g. Q3 Product Feedback"
                  value={draft.basicInfo.title}
                  onChange={(e) => {
                    updateBasicInfo({ title: e.target.value })
                    clearBasicInfoError("title")
                  }}
                />
                <FieldError>{basicInfoErrors.title}</FieldError>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Description (Optional)</label>
                <Textarea 
                  className="resize-none min-h-[80px] bg-muted/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary"
                  placeholder="Add context for your respondents..."
                  value={draft.basicInfo.description}
                  onChange={(e) => updateBasicInfo({ description: e.target.value })}
                />
              </div>
            </div>
          </BentoCard>

          <BentoCard className="p-5 bg-gradient-to-br from-background to-muted/20 border-border/50">
            <h2 className="text-lg font-bold font-heading uppercase tracking-widest mb-4 flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              Configuration
            </h2>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-background border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-primary/10 rounded-lg shrink-0">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Anonymous Mode</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Don't collect respondent identities.</p>
                  </div>
                </div>
                <Switch 
                  checked={draft.basicInfo.isAnonymous}
                  onCheckedChange={(c) => updateBasicInfo({ isAnonymous: c })}
                  className="mt-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                  <Hash className="h-3 w-3" /> Response Goal (Optional)
                </label>
                <Input 
                  type="number"
                  placeholder="e.g. 100"
                  value={draft.basicInfo.responseGoal || ""}
                  onChange={(e) => {
                    updateBasicInfo({ responseGoal: e.target.value ? parseInt(e.target.value) : null })
                    clearBasicInfoError("responseGoal")
                  }}
                  className="bg-muted/50 border-border/50"
                />
                <FieldError>{basicInfoErrors.responseGoal}</FieldError>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Expiry Date
                </label>
                <Input 
                  type="datetime-local"
                  value={draft.basicInfo.expiresAt ? new Date(draft.basicInfo.expiresAt).toISOString().slice(0, 16) : ""}
                  onChange={(e) => {
                    updateBasicInfo({ expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null })
                    clearBasicInfoError("expiresAt")
                  }}
                  className={cn(
                    "bg-muted/50 border-border/50",
                    basicInfoErrors.expiresAt && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <FieldError>{basicInfoErrors.expiresAt}</FieldError>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* RIGHT COLUMN: Canvas */}
        <div className="xl:col-span-8 space-y-6">
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
            className="w-full h-24 border-2 border-dashed border-border/50 bg-card/30 backdrop-blur-sm hover:bg-muted/50 hover:border-primary/50 text-muted-foreground hover:text-foreground font-bold tracking-widest transition-all rounded-2xl group"
          >
            <Plus className="mr-2 h-5 w-5 group-hover:scale-125 transition-transform text-primary" />
            Add New Question
          </Button>
          <div className="h-24" /> {/* Spacer for floating dock */}
        </div>
      </div>

      {/* DYNAMIC DOCK (Floating Action Bar) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-12 duration-700 fade-in">
        <div className="bg-background/80 backdrop-blur-2xl border border-border/50 shadow-2xl rounded-full p-2 flex items-center gap-2">
          
          <div className="px-4 hidden sm:flex items-center gap-2 border-r border-border/50 pr-6 mr-2">
            <AlertTriangle className={cn("h-4 w-4", localQuestions.length === 0 ? "text-yellow-500" : "text-primary")} />
            <span className="text-sm font-bold text-muted-foreground whitespace-nowrap">
              {localQuestions.length} Questions
            </span>
          </div>

          <Button 
            variant="ghost" 
            className="rounded-full font-bold px-6 hover:bg-muted"
            onClick={handleSaveDraft}
            disabled={isSaving || isActivating}
          >
            {isSaving ? (
              <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Draft
          </Button>
          
          <Button 
            className="rounded-full font-bold px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            onClick={handleActivate}
            disabled={isSaving || isActivating || localQuestions.length === 0 || !draft.basicInfo.expiresAt}
          >
            {isActivating ? (
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-2" />
            ) : (
              <Rocket className="mr-2 h-4 w-4" />
            )}
            Activate Poll
          </Button>
        </div>
      </div>
    </div>
  )
}
