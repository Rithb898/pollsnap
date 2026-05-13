import { useState, useEffect, useCallback, useRef } from "react"

export interface DraftBasicInfo {
  title: string
  description: string
  isAnonymous: boolean
  expiresAt: string | null
  responseGoal: number | null
}

export interface DraftOption {
  id: string
  text: string
}

export interface DraftQuestion {
  id: string
  text: string
  isMandatory: boolean
  options: DraftOption[]
}

export interface DraftPoll {
  pollId: string | null
  step: number
  basicInfo: DraftBasicInfo
  questions: DraftQuestion[]
  lastSaved: string | null
}

const STORAGE_KEY = "poll_draft"
const AUTO_SAVE_INTERVAL = 30000

const defaultBasicInfo: DraftBasicInfo = {
  title: "",
  description: "",
  isAnonymous: false,
  expiresAt: null,
  responseGoal: null,
}

const defaultDraft: DraftPoll = {
  pollId: null,
  step: 1,
  basicInfo: defaultBasicInfo,
  questions: [],
  lastSaved: null,
}

function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function usePollDraft(pollId?: string) {
  const [draft, setDraft] = useState<DraftPoll>(() => {
    if (pollId) {
      return { ...defaultDraft, pollId }
    }
    return defaultDraft
  })
  const [isRestored, setIsRestored] = useState(false)
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const saveToStorage = useCallback((d: DraftPoll) => {
    const toSave = { ...d, lastSaved: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  }, [])

  const loadFromStorage = useCallback((): DraftPoll | null => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    try {
      return JSON.parse(stored) as DraftPoll
    } catch {
      return null
    }
  }, [])

  const clearStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  useEffect(() => {
    if (!pollId && !isRestored) {
      const stored = loadFromStorage()
      if (stored) {
        setDraft(stored)
        setIsRestored(true)
      }
    }
  }, [pollId, isRestored, loadFromStorage])

  useEffect(() => {
    if (!pollId) {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current)
      }
      autoSaveTimerRef.current = setInterval(() => {
        saveToStorage(draft)
      }, AUTO_SAVE_INTERVAL)

      return () => {
        if (autoSaveTimerRef.current) {
          clearInterval(autoSaveTimerRef.current)
        }
      }
    }
  }, [draft, pollId, saveToStorage])

  const updateBasicInfo = useCallback((info: Partial<DraftBasicInfo>) => {
    setDraft((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, ...info },
    }))
  }, [])

  const setStep = useCallback((step: number) => {
    setDraft((prev) => ({ ...prev, step }))
  }, [])

  const setPollId = useCallback((id: string) => {
    setDraft((prev) => ({ ...prev, pollId: id }))
  }, [])

  const addQuestion = useCallback((text: string, isMandatory = true) => {
    const newQuestion: DraftQuestion = {
      id: generateTempId(),
      text,
      isMandatory,
      options: [],
    }
    setDraft((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }))
    return newQuestion
  }, [])

  const updateQuestion = useCallback(
    (questionId: string, updates: Partial<Omit<DraftQuestion, "id" | "options">>) => {
      setDraft((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, ...updates } : q
        ),
      }))
    },
    []
  )

  const deleteQuestion = useCallback((questionId: string) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }))
  }, [])

  const addOption = useCallback((questionId: string, text: string) => {
    const newOption: DraftOption = {
      id: generateTempId(),
      text,
    }
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, options: [...q.options, newOption] } : q
      ),
    }))
    return newOption
  }, [])

  const updateOption = useCallback(
    (questionId: string, optionId: string, text: string) => {
      setDraft((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                options: q.options.map((o) =>
                  o.id === optionId ? { ...o, text } : o
                ),
              }
            : q
        ),
      }))
    },
    []
  )

  const deleteOption = useCallback((questionId: string, optionId: string) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.filter((o) => o.id !== optionId) }
          : q
      ),
    }))
  }, [])

  const resetDraft = useCallback(() => {
    setDraft(defaultDraft)
    clearStorage()
  }, [clearStorage])

  const restoreFromStorage = useCallback(() => {
    const stored = loadFromStorage()
    if (stored) {
      setDraft(stored)
      return true
    }
    return false
  }, [loadFromStorage])

  return {
    draft,
    isRestored,
    updateBasicInfo,
    setStep,
    setPollId,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addOption,
    updateOption,
    deleteOption,
    resetDraft,
    restoreFromStorage,
    clearStorage,
    saveToStorage,
  }
}