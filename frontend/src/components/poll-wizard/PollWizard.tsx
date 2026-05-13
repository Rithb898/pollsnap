import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { Stepper } from "./Stepper"
import { BasicInfo } from "./BasicInfo"
import { Questions } from "./Questions"
import { Options } from "./Options"
import { Review } from "./Review"
import { usePollDraft, type DraftQuestion, type DraftOption } from "@/hooks/use-poll-draft"
import {
  pollsApi,
  questionsApi,
  optionsApi,
  type PollDTO,
  type QuestionDTO,
  type OptionDTO,
  SWR_KEYS,
} from "@/lib/api"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface PollWizardProps {
  mode: "create" | "edit"
}

const STEPS = [
  { number: 1, label: "Basic Info" },
  { number: 2, label: "Questions" },
  { number: 3, label: "Options" },
  { number: 4, label: "Review" },
]

export function PollWizard({ mode }: PollWizardProps) {
  const { id: pollId } = useParams()
  const navigate = useNavigate()
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [localQuestions, setLocalQuestions] = useState<DraftQuestion[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [serverQuestionsMap, setServerQuestionsMap] = useState<Map<string, QuestionDTO>>(new Map())
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)

  const {
    draft,
    updateBasicInfo,
    setStep,
    setPollId,
    resetDraft,
    clearStorage,
    restoreFromStorage,
  } = usePollDraft(pollId)

  const loadPoll = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      const poll = await pollsApi.get(id) as PollDTO
      
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
      setPollId(id)
      
      const questions = await questionsApi.list(id) as QuestionDTO[]
      
      const map = new Map<string, QuestionDTO>()
      questions.forEach(q => map.set(q.id, q))
      setServerQuestionsMap(map)
      
      const mappedQuestions: DraftQuestion[] = questions.map((q) => ({
        id: q.id,
        text: q.text,
        isMandatory: q.isMandatory,
        options: q.options.map((o: OptionDTO) => ({
          id: o.id,
          text: o.text,
        })),
      }))
      
      setLocalQuestions(mappedQuestions)
      setIsLoaded(true)
    } catch {
      toast.error("Failed to load poll")
      navigate("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }, [navigate, updateBasicInfo, setPollId])

  useEffect(() => {
    if (mode === "edit" && pollId && !isLoaded) {
      const load = async () => {
        await loadPoll(pollId)
      }
      load()
    }
  }, [mode, pollId, isLoaded, loadPoll])

  const handleAddQuestion = useCallback((text: string, isMandatory: boolean) => {
    const newQuestion: DraftQuestion = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      isMandatory,
      options: [],
    }
    setLocalQuestions((prev) => [...prev, newQuestion])
  }, [])

  const handleUpdateQuestion = useCallback((
    questionId: string,
    updates: Partial<Omit<DraftQuestion, "id" | "options">>
  ) => {
    setLocalQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    )
  }, [])

  const handleDeleteQuestion = useCallback((questionId: string) => {
    setLocalQuestions((prev) => prev.filter((q) => q.id !== questionId))
  }, [])

  const handleAddOption = useCallback((questionId: string, text: string) => {
    const newOption: DraftOption = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
    }
    setLocalQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, options: [...q.options, newOption] } : q
      )
    )
  }, [])

  const handleUpdateOption = useCallback((
    questionId: string,
    optionId: string,
    text: string
  ) => {
    setLocalQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === optionId ? { ...o, text } : o
              ),
            }
          : q
      )
    )
  }, [])

  const handleDeleteOption = useCallback((questionId: string, optionId: string) => {
    setLocalQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.filter((o) => o.id !== optionId) }
          : q
      )
    )
  }, [])

  const questions = mode === "edit" && isLoaded ? localQuestions : draft.questions

  const handleStepClick = (step: number) => {
    if (completedSteps.includes(step) || step <= draft.step) {
      setStep(step)
    }
  }

  const completeStep = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step])
    }
  }

  const handleBasicInfoNext = async () => {
    if (mode === "create" && !draft.pollId) {
      try {
        setIsLoading(true)
        const result = await pollsApi.create({
          title: draft.basicInfo.title,
          description: draft.basicInfo.description,
          isAnonymous: draft.basicInfo.isAnonymous,
          expiresAt: draft.basicInfo.expiresAt || undefined,
          responseGoal: draft.basicInfo.responseGoal || undefined,
        })
        setPollId(result.id)
        completeStep(1)
        setStep(2)
      } catch {
        toast.error("Failed to create poll")
      } finally {
        setIsLoading(false)
      }
    } else {
      completeStep(1)
      setStep(2)
    }
  }

  const handleQuestionsNext = () => {
    completeStep(2)
    setStep(3)
  }

  const handleOptionsNext = () => {
    completeStep(3)
    setStep(4)
  }

  const handleSaveDraft = async () => {
    const currentPollId = mode === "edit" && isLoaded ? pollId : draft.pollId
    if (!currentPollId) return
    
    try {
      setIsSaving(true)
      setError(undefined)
      
      const currentQuestions = mode === "edit" && isLoaded ? localQuestions : draft.questions
      
      await pollsApi.update(currentPollId, {
        title: draft.basicInfo.title,
        description: draft.basicInfo.description,
        isAnonymous: draft.basicInfo.isAnonymous,
        expiresAt: draft.basicInfo.expiresAt || undefined,
        responseGoal: draft.basicInfo.responseGoal || undefined,
      })
      
      for (const question of currentQuestions) {
        if (question.id.startsWith("temp_")) {
          const result = await questionsApi.create(currentPollId, {
            text: question.text,
            isMandatory: question.isMandatory,
          })
          
          for (const option of question.options) {
            await optionsApi.create(currentPollId, result.id, {
              text: option.text,
            })
          }
        } else {
          const existing = serverQuestionsMap.get(question.id)
          if (existing && (existing.text !== question.text || existing.isMandatory !== question.isMandatory)) {
            await questionsApi.update(currentPollId, question.id, {
              text: question.text,
              isMandatory: question.isMandatory,
            })
          }
          
          const existingOptionTexts = existing?.options.map((o) => o.text) || []
          const currentOptionTexts = question.options.map((o) => o.text)
          
          for (const option of question.options) {
            if (option.id.startsWith("temp_")) {
              await optionsApi.create(currentPollId, question.id, {
                text: option.text,
              })
            } else if (!existingOptionTexts.includes(option.text)) {
              await optionsApi.create(currentPollId, question.id, {
                text: option.text,
              })
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
      
      const questionsToDelete = Array.from(serverQuestionsMap.values()).filter(
        (sq) => !currentQuestions.find((cq) => cq.id === sq.id)
      )
      
      for (const q of questionsToDelete) {
        await questionsApi.delete(currentPollId, q.id)
      }
      
      await mutate(SWR_KEYS.polls())
      toast.success("Draft saved")
      
      if (mode === "create") {
        clearStorage()
      } else {
        loadPoll(currentPollId)
      }
    } catch {
      setError("Failed to save draft")
      toast.error("Failed to save draft")
    } finally {
      setIsSaving(false)
    }
  }

  const handleActivate = async () => {
    const currentPollId = mode === "edit" && isLoaded ? pollId : draft.pollId
    if (!currentPollId) return
    
    try {
      setIsActivating(true)
      setError(undefined)
      
      await handleSaveDraft()
      
      await pollsApi.activate(currentPollId)
      await mutate(SWR_KEYS.polls())
      
      toast.success("Poll activated!")
      
      if (mode === "create") {
        clearStorage()
      }
      
      navigate(`/poll/${currentPollId}`)
    } catch {
      setError("Failed to activate poll")
      toast.error("Failed to activate poll")
    } finally {
      setIsActivating(false)
    }
  }

  const handleRestore = () => {
    if (restoreFromStorage()) {
      setShowRestoreDialog(false)
      toast.success("Draft restored")
    }
  }

  const handleDiscard = () => {
    resetDraft()
    setShowRestoreDialog(false)
  }

  if (isLoading && mode === "edit" && !isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (showRestoreDialog && !pollId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="max-w-md p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Restore Draft?</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            You have an unsaved poll draft. Would you like to continue editing it?
          </p>
          <div className="flex gap-2">
            <Button onClick={handleRestore}>Restore</Button>
            <Button variant="outline" onClick={handleDiscard}>
              Discard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Stepper
        steps={STEPS}
        currentStep={draft.step}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      <div className="max-w-3xl mx-auto">
        {draft.step === 1 && (
          <BasicInfo
            basicInfo={draft.basicInfo}
            onUpdate={updateBasicInfo}
            onNext={handleBasicInfoNext}
          />
        )}
        {draft.step === 2 && (
          <Questions
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onNext={handleQuestionsNext}
            onBack={() => setStep(1)}
          />
        )}
        {draft.step === 3 && (
          <Options
            questions={questions}
            onAddOption={handleAddOption}
            onUpdateOption={handleUpdateOption}
            onDeleteOption={handleDeleteOption}
            onNext={handleOptionsNext}
            onBack={() => setStep(2)}
          />
        )}
        {draft.step === 4 && (
          <Review
            draft={{ ...draft, questions }}
            onSaveDraft={handleSaveDraft}
            onActivate={handleActivate}
            onBack={() => setStep(3)}
            isSaving={isSaving}
            isActivating={isActivating}
            error={error}
          />
        )}
      </div>
    </div>
  )
}