import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router"
import useSWR from "swr"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, Sparkles, AlertCircle, ArrowRight, ArrowLeft, BarChart3, Share2 } from "lucide-react"
import { useSocket } from "@/hooks/use-socket"
import { SWR_KEYS, pollsApi, responsesApi, analyticsApi, type PollDTO, type QuestionDTO, type PollAnalyticsDTO } from "@/lib/api"
import { BentoCard } from "@/components/dashboard/BentoCard"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"

interface PublicPollResponse extends PollDTO {
  questions: QuestionDTO[]
}

export default function PublicPoll() {
  const { pollId } = useParams()
  const navigate = useNavigate()
  
  // Real API fetching
  const { data: pollData, error, isLoading } = useSWR<PublicPollResponse>(
    pollId ? SWR_KEYS.poll(pollId) : null,
    () => pollsApi.get(pollId!) as Promise<PublicPollResponse>
  )

  const { on } = useSocket("/respondent", pollId || "")
  const [liveStatus, setLiveStatus] = useState<"active" | "closed">("active")
  
  // Voting State
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  
  // Pagination State
  const [currentIndex, setCurrentIndex] = useState(0)

  // Listen for poll status changes via WebSockets
  useEffect(() => {
    if (pollData) setLiveStatus(pollData.status as any)
  }, [pollData])

  useEffect(() => {
    const unsubPollClosed = on<{ pollId: string }>("poll:closed", () => setLiveStatus("closed"))
    return () => {
      unsubPollClosed()
    }
  }, [on])

  // Results Fetching (only enabled when showResults is true)
  const { data: resultsData, mutate: refreshResults } = useSWR<PollAnalyticsDTO>(
    showResults && pollId ? SWR_KEYS.publicResults(pollId) : null,
    () => analyticsApi.getPublicResults(pollId!),
    { refreshInterval: 5000 } // Auto-refresh live results
  )

  // Listen for live vote updates when viewing results
  useEffect(() => {
    if (!showResults) return
    const unsubVote = on("vote:update", () => {
      refreshResults()
    })
    return () => unsubVote()
  }, [showResults, on, refreshResults])

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (liveStatus !== "active" || hasSubmitted) return
    setAnswers(prev => ({ ...prev, [questionId]: optionId }))
    
    // Auto-advance logic
    if (pollData && currentIndex < pollData.questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
      }, 400)
    }
  }

  const handleNext = () => {
    if (pollData && currentIndex < pollData.questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!pollData) return
    
    const missingMandatory = pollData.questions.find(q => q.isMandatory && !answers[q.id])
    if (missingMandatory) {
      toast.error(`Please answer the required question: "${missingMandatory.text}"`)
      const idx = pollData.questions.findIndex(q => q.id === missingMandatory.id)
      setCurrentIndex(idx)
      return
    }

    try {
      setIsSubmitting(true)
      const submissionData = {
        answers: Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId }))
      }
      await responsesApi.submit(pollId!, submissionData)
      setHasSubmitted(true)
      
      // Fire Confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899']
      })
      
      // Wait 2 seconds, then transition to results
      setTimeout(() => {
        setShowResults(true)
      }, 2000)

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit response. You may have already voted.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = useMemo(() => {
    if (!pollData?.questions?.length) return 0
    return Math.round((Object.keys(answers).length / pollData.questions.length) * 100)
  }, [answers, pollData])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="font-heading font-bold text-muted-foreground animate-pulse">Loading Poll...</p>
      </div>
    )
  }

  if (error || !pollData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-6" />
        <h1 className="text-3xl font-heading font-black mb-2">Poll Not Found</h1>
        <p className="text-muted-foreground mb-8">This poll doesn't exist or has been deleted.</p>
        <Button onClick={() => navigate("/")} size="lg">Return Home</Button>
      </div>
    )
  }

  if (pollData.status === "draft") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-heading font-black mb-2">Poll Not Active</h1>
        <p className="text-muted-foreground max-w-md">The creator is still working on this poll. Check back later.</p>
      </div>
    )
  }

  const currentQuestion = pollData.questions[currentIndex]
  const isLastQuestion = currentIndex === pollData.questions.length - 1
  const isCurrentMandatory = currentQuestion.isMandatory
  const hasAnsweredCurrent = !!answers[currentQuestion.id]

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-background via-background to-primary/5 flex flex-col relative overflow-hidden">
      
      {/* Progress Bar (Hidden during Results Mode) */}
      {!showResults && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted z-50">
          <div 
            className="h-full bg-primary transition-all duration-700 ease-in-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-1000 w-full">
        
        {/* PHASE 3: LIVE RESULTS REVEAL */}
        {showResults ? (
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-24">
            
            {/* Results Header */}
            <div className="text-center mb-10 mt-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-6 animate-pulse">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-4">
                Live Results
              </h1>
              <p className="text-xl text-muted-foreground font-medium">
                Here's how everyone else voted on <span className="text-foreground">{pollData.title}</span>.
              </p>
            </div>

            {/* Results Feed */}
            <div className="space-y-6">
              {!resultsData ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                resultsData.questions.map((q, idx) => (
                  <BentoCard key={q.id} className="p-6 md:p-8 border-border/50 bg-card/60 backdrop-blur-xl">
                    <h3 className="text-xl md:text-2xl font-bold font-heading mb-6 flex items-start gap-3">
                      <span className="text-primary opacity-50">{idx + 1}.</span> {q.text}
                    </h3>
                    
                    <div className="space-y-4">
                      {q.options.map((opt) => {
                        const isUserChoice = answers[q.id] === opt.id
                        return (
                          <div key={opt.id} className="relative overflow-hidden rounded-xl border border-border/50 bg-background/50 p-4">
                            {/* Animated Background Bar */}
                            <div 
                              className={cn(
                                "absolute top-0 left-0 bottom-0 z-0 transition-all duration-1000 ease-out",
                                isUserChoice ? "bg-primary/20" : "bg-muted"
                              )}
                              style={{ width: `${opt.percentage}%` }}
                            />
                            
                            {/* Content */}
                            <div className="relative z-10 flex items-center justify-between gap-4">
                              <span className="font-bold flex items-center gap-2 text-lg">
                                {opt.text}
                                {isUserChoice && <CheckCircle2 className="h-4 w-4 text-primary" />}
                              </span>
                              <span className="font-heading font-black text-xl">
                                {opt.percentage}%
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 text-right font-bold tracking-widest uppercase">
                      {q.totalAnswers} Votes
                    </p>
                  </BentoCard>
                ))
              )}
            </div>

            {/* THE VIRAL HOOK */}
            <div className="mt-16 flex flex-col items-center justify-center space-y-6 animate-in slide-in-from-bottom-8 duration-700 delay-500">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full font-bold h-14 px-8 border-2"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success("Link copied to clipboard!")
                }}
              >
                <Share2 className="mr-2 h-5 w-5" /> Share this Poll
              </Button>
              
              <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 text-center max-w-lg w-full">
                <h3 className="text-2xl font-black font-heading mb-2">Want to ask your own questions?</h3>
                <p className="text-muted-foreground mb-6">Create beautiful, engaging polls like this one in seconds. 100% free.</p>
                <Button 
                  size="lg" 
                  className="w-full rounded-full h-14 font-black tracking-widest uppercase text-lg shadow-xl shadow-primary/25 hover:scale-105 transition-all"
                  onClick={() => navigate("/")}
                >
                  Create Your PollSnap <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

          </div>
        ) : hasSubmitted ? (
          /* PHASE 2: SUBMISSION SUCCESS (Morphing State) */
          <BentoCard className="w-full max-w-2xl p-16 text-center flex flex-col items-center border-primary/20 bg-primary/5 scale-105 animate-in zoom-in-95 duration-500">
            <div className="h-24 w-24 bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-12 w-12 text-primary animate-in zoom-in duration-300" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-black mb-2">Response Recorded!</h1>
            <p className="text-xl text-muted-foreground font-medium animate-pulse">Calculating live results...</p>
          </BentoCard>
        ) : (
          /* PHASE 1: VOTING STATE */
          <div className="w-full max-w-3xl animate-in slide-in-from-bottom-8 duration-500">
            
            {/* Poll Title Context (Subtle) */}
            <div className="text-center mb-12 opacity-50 hover:opacity-100 transition-opacity">
              <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">{pollData.title}</h2>
            </div>

            <BentoCard className="p-8 md:p-12 border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl">
              
              {/* Question Meta */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-primary font-bold font-heading tracking-widest text-sm bg-primary/10 px-3 py-1 rounded-full">
                  QUESTION {currentIndex + 1} OF {pollData.questions.length}
                </span>
                {isCurrentMandatory && <span className="text-destructive font-bold text-sm">* Required</span>}
              </div>

              {/* Question Text */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight mb-10">
                {currentQuestion.text}
              </h1>

              {/* Options Grid */}
              <div className="grid gap-4">
                {currentQuestion.options.map((option) => {
                  const isSelected = answers[currentQuestion.id] === option.id
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                      disabled={liveStatus !== "active"}
                      className={cn(
                        "w-full text-left p-5 md:p-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group relative overflow-hidden",
                        isSelected 
                          ? "border-primary bg-primary/10 shadow-[0_0_30px_-10px_var(--color-primary)] ring-2 ring-primary/20 scale-[1.02]" 
                          : "border-border/50 bg-background/50 hover:border-primary/50 hover:bg-muted/50 hover:scale-[1.01]"
                      )}
                    >
                      <span className={cn(
                        "text-xl md:text-2xl font-bold relative z-10 transition-colors",
                        isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {option.text}
                      </span>
                      
                      <div className={cn(
                        "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all z-10 shrink-0 ml-4",
                        isSelected ? "border-primary bg-primary scale-110" : "border-border"
                      )}>
                        {isSelected && <CheckCircle2 className="h-5 w-5 text-primary-foreground animate-in zoom-in duration-200" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Navigation Controls */}
              <div className="mt-12 flex items-center justify-between border-t border-border/50 pt-8">
                <Button 
                  variant="ghost" 
                  size="lg" 
                  onClick={handleBack} 
                  disabled={currentIndex === 0}
                  className="font-bold text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                
                {isLastQuestion ? (
                  <Button 
                    size="lg" 
                    onClick={handleSubmit}
                    disabled={isSubmitting || (isCurrentMandatory && !hasAnsweredCurrent)}
                    className="font-heading font-black uppercase tracking-wider h-14 px-8 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Response"}
                    {!isSubmitting && <Sparkles className="ml-2 h-5 w-5" />}
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    onClick={handleNext}
                    disabled={isCurrentMandatory && !hasAnsweredCurrent}
                    className="font-bold h-12 px-6 rounded-full"
                  >
                    Next <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </div>
            </BentoCard>

            {/* Inactive State Notice */}
            {liveStatus !== "active" && (
              <div className="mt-8 text-center p-4 rounded-xl bg-destructive/10 text-destructive font-bold animate-in fade-in">
                Voting has concluded for this poll.
                <Button variant="link" className="text-destructive underline ml-2" onClick={() => setShowResults(true)}>
                  View Results
                </Button>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  )
}