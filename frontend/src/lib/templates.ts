export interface PollTemplateQuestion {
  text: string
  options: string[]
  type: "choice" | "rating" | "text" | "date"
}

export interface PollTemplate {
  id: string
  name: string
  icon: string
  description: string
  questions: PollTemplateQuestion[]
}

export const pollTemplates: PollTemplate[] = [
  {
    id: "feedback-survey",
    name: "Feedback Survey",
    icon: "MessageSquare",
    description: "Collect feedback with rating + open question",
    questions: [
      { text: "How satisfied are you?", options: ["1", "2", "3", "4", "5"], type: "rating" },
      { text: "Any additional comments?", options: [], type: "text" },
    ],
  },
  {
    id: "event-poll",
    name: "Event Scheduling",
    icon: "Calendar",
    description: "Find the best time for everyone",
    questions: [{ text: "Which date works best?", options: [], type: "date" }],
  },
  {
    id: "product-vote",
    name: "Product Voting",
    icon: "Vote",
    description: "Let users vote on options",
    questions: [{ text: "Which feature should we build?", options: [], type: "choice" }],
  },
  {
    id: "meeting-poll",
    name: "Quick Meeting Poll",
    icon: "Users",
    description: "Simple yes/no or multiple choice",
    questions: [{ text: "Should we have the meeting?", options: ["Yes", "No", "Maybe"], type: "choice" }],
  },
]
