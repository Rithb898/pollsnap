import axios from "axios"
import { authClient } from "./auth-client"

const fetcher = async (url: string) => {
  const session = await authClient.getSession()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (session.data?.session) {
    headers.Authorization = `Bearer ${session.data.session.token}`
  }

  const response = await axios.get(url, {
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8888",
    headers,
    withCredentials: true,
  })
  return response.data?.data ?? response.data
}

export const api = {
  post: async <T>(url: string, data?: unknown): Promise<T> => {
    const session = await authClient.getSession()
    const headers: Record<string, string> = {}
    if (session.data?.session) {
      headers.Authorization = `Bearer ${session.data.session.token}`
    }

    const response = await axios.post(url, data, {
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:8888",
      headers,
      withCredentials: true,
    })
    return response.data?.data ?? response.data
  },

  patch: async <T>(url: string, data?: unknown): Promise<T> => {
    const session = await authClient.getSession()
    const headers: Record<string, string> = {}
    if (session.data?.session) {
      headers.Authorization = `Bearer ${session.data.session.token}`
    }

    const response = await axios.patch(url, data, {
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:8888",
      headers,
      withCredentials: true,
    })
    return response.data?.data ?? response.data
  },

  delete: async <T>(url: string): Promise<T> => {
    const session = await authClient.getSession()
    const headers: Record<string, string> = {}
    if (session.data?.session) {
      headers.Authorization = `Bearer ${session.data.session.token}`
    }

    const response = await axios.delete(url, {
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:8888",
      headers,
      withCredentials: true,
    })
    return response.data?.data ?? response.data
  },

  get: fetcher,
}

export const SWR_KEYS = {
  polls: (page = 1, limit = 10, status?: string) =>
    ["/api/v1/polls", page, limit, status] as const,
  poll: (id: string) => [`/api/v1/polls/${id}`] as const,
  questions: (pollId: string) => [`/api/v1/polls/${pollId}/questions`] as const,
  options: (pollId: string, questionId: string) =>
    [`/api/v1/polls/${pollId}/questions/${questionId}/options`] as const,
  dashboardStats: () => ["/api/v1/dashboard/stats"] as const,
  dashboardTrends: (days: number) => ["/api/v1/dashboard/trends", days] as const,
  dashboardRecentActivity: () => ["/api/v1/dashboard/recent-activity"] as const,
  dashboardAudienceInsights: () => ["/api/v1/dashboard/audience-insights"] as const,
  dashboardPlanUsage: () => ["/api/v1/dashboard/plan-usage"] as const,
  pollAnalytics: (pollId: string) => [`/api/v1/polls/${pollId}/analytics`] as const,
  publicResults: (pollId: string) => [`/api/v1/polls/${pollId}/results`] as const,
  globalAnalyticsTrends: (days: number) => [`/api/v1/analytics/trends`, days] as const,
  globalAnalyticsDevice: () => ["/api/v1/analytics/device"] as const,
  globalAnalyticsBrowser: () => ["/api/v1/analytics/browser"] as const,
  globalAnalyticsOs: () => ["/api/v1/analytics/os"] as const,
  globalAnalyticsLeaderboard: () => ["/api/v1/analytics/leaderboard"] as const,
  globalAnalyticsHeatmap: () => ["/api/v1/analytics/heatmap"] as const,
  globalAnalyticsGeographic: () => ["/api/v1/analytics/geographic"] as const,
  globalAnalyticsAudience: () => ["/api/v1/analytics/audience"] as const,
}

export interface PollDTO {
  id: string
  title: string
  description?: string
  isAnonymous: boolean
  expiresAt?: string
  responseGoal?: number
  status: "draft" | "active" | "closed"
  createdAt: string
  updatedAt: string
  responseCount?: number
  activityTrend?: number[]
}

export interface CreatePollDTO {
  title: string
  description?: string
  isAnonymous?: boolean
  expiresAt?: string
  responseGoal?: number
}

export interface UpdatePollDTO {
  title?: string
  description?: string
  isAnonymous?: boolean
  expiresAt?: string
  responseGoal?: number
  status?: string
}

export interface QuestionDTO {
  id: string
  text: string
  isMandatory: boolean
  options: OptionDTO[]
  order: number
}

export interface CreateQuestionDTO {
  text: string
  isMandatory?: boolean
}

export interface UpdateQuestionDTO {
  text?: string
  isMandatory?: boolean
  order?: number
}

export interface OptionDTO {
  id: string
  text: string
}

export interface CreateOptionDTO {
  text: string
}

export interface UpdateOptionDTO {
  text: string
}

export const pollsApi = {
  create: (data: CreatePollDTO) =>
    api.post<{ id: string; poll: PollDTO }>("/api/v1/polls", data),
  get: (id: string) => fetcher(`/api/v1/polls/${id}`),
  update: (id: string, data: UpdatePollDTO) =>
    api.patch<{ id: string; poll: PollDTO }>(`/api/v1/polls/${id}`, data),
  delete: (id: string) =>
    api.delete<{ success: boolean }>(`/api/v1/polls/${id}`),
  activate: (id: string) =>
    api.post<{ id: string; status: string }>(`/api/v1/polls/${id}/activate`),
  list: (page = 1, limit = 10, status?: string) =>
    fetcher(
      `/api/v1/polls?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`
    ),
}

export const questionsApi = {
  create: (pollId: string, data: CreateQuestionDTO) =>
    api.post<{ id: string; question: QuestionDTO }>(
      `/api/v1/polls/${pollId}/questions`,
      data
    ),
  update: (pollId: string, questionId: string, data: UpdateQuestionDTO) =>
    api.patch<{ id: string; question: QuestionDTO }>(
      `/api/v1/polls/${pollId}/questions/${questionId}`,
      data
    ),
  delete: (pollId: string, questionId: string) =>
    api.delete<{ success: boolean }>(
      `/api/v1/polls/${pollId}/questions/${questionId}`
    ),
  list: (pollId: string) => fetcher(`/api/v1/polls/${pollId}/questions`),
}

export const optionsApi = {
  create: (pollId: string, questionId: string, data: CreateOptionDTO) =>
    api.post<{ id: string; option: OptionDTO }>(
      `/api/v1/polls/${pollId}/questions/${questionId}/options`,
      data
    ),
  update: (
    pollId: string,
    questionId: string,
    optionId: string,
    data: UpdateOptionDTO
  ) =>
    api.patch<{ id: string; option: OptionDTO }>(
      `/api/v1/polls/${pollId}/questions/${questionId}/options/${optionId}`,
      data
    ),
  delete: (pollId: string, questionId: string, optionId: string) =>
    api.delete<{ success: boolean }>(
      `/api/v1/polls/${pollId}/questions/${questionId}/options/${optionId}`
    ),
}

export const responsesApi = {
  submit: (pollId: string, data: { answers: { questionId: string; optionId: string }[] }) =>
    api.post<{ success: boolean; responseId: string }>(
      `/api/v1/polls/${pollId}/responses`,
      data
    ),
}

export interface DashboardStatsDTO {
  totalPolls: number
  activePolls: number
  totalResponses: number
  completionRate: number
}

export interface TrendDataPoint {
  date: string
  responses: number
}

export interface RecentActivityDTO {
  id: string
  user: string
  action: string
  poll: string
  time: string
}

export interface AudienceInsightsDTO {
  mobile: number
  desktop: number
  tablet: number
}

export interface PlanUsageDTO {
  responsesUsed: number
  responsesTotal: number
}

export const dashboardApi = {
  getStats: () => fetcher("/api/v1/dashboard/stats") as Promise<DashboardStatsDTO>,
  getTrends: (days: number = 7) => fetcher(`/api/v1/dashboard/trends?days=${days}`) as Promise<TrendDataPoint[]>,
  getRecentActivity: () => fetcher("/api/v1/dashboard/recent-activity") as Promise<RecentActivityDTO[]>,
  getAudienceInsights: () => fetcher("/api/v1/dashboard/audience-insights") as Promise<AudienceInsightsDTO>,
  getPlanUsage: () => fetcher("/api/v1/dashboard/plan-usage") as Promise<PlanUsageDTO>,
}

export interface QuestionAnalyticsDTO {
  id: string
  text: string
  isMandatory: boolean
  totalAnswers: number
  options: {
    id: string
    text: string
    count: number
    percentage: number
  }[]
}

export interface RecentVoteDTO {
  id: string
  time: string
  respondent: {
    id: string
    displayName: string
    email: string
  } | null
}

export interface PollAnalyticsDTO {
  poll: {
    id: string
    title: string
    description: string | null
    responseGoal: number | null
    status: string
  }
  totalResponses: number
  goalProgress: number | null
  completionRate: number
  questions: QuestionAnalyticsDTO[]
  recentVotes: RecentVoteDTO[]
  audience: {
    geographic: {
      country: string
      code: string
      count: number
      percentage: number
    }[]
    devices: {
      type: string
      count: number
      percentage: number
    }[]
  }
}

export const analyticsApi = {
  getPollAnalytics: (pollId: string) =>
    fetcher(`/api/v1/polls/${pollId}/analytics`) as Promise<PollAnalyticsDTO>,
  getPublicResults: (pollId: string) =>
    fetcher(`/api/v1/polls/${pollId}/results`) as Promise<PollAnalyticsDTO>,
}

export interface GlobalTrendsDataPoint {
  date: string
  responses: number
  completionRate: number
}

export interface DeviceBreakdownDTO {
  mobile: number
  desktop: number
  tablet: number
}

export interface BrowserOsDataPoint {
  name: string
  value: number
}

export interface LeaderboardEntryDTO {
  id: string
  title: string
  responses: number
  rate: number
  trend: string
}

export interface HeatmapDataDTO {
  day: string
  hours: number[]
}

export interface CountryDataDTO {
  country: string
  code: string
  users: number
  percentage: number
}

export const globalAnalyticsApi = {
  getTrends: (days: number = 30) =>
    fetcher(`/api/v1/analytics/trends?days=${days}`) as Promise<GlobalTrendsDataPoint[]>,
  getDeviceBreakdown: () =>
    fetcher("/api/v1/analytics/device") as Promise<DeviceBreakdownDTO>,
  getBrowserBreakdown: () =>
    fetcher("/api/v1/analytics/browser") as Promise<BrowserOsDataPoint[]>,
  getOsBreakdown: () =>
    fetcher("/api/v1/analytics/os") as Promise<BrowserOsDataPoint[]>,
  getLeaderboard: () =>
    fetcher("/api/v1/analytics/leaderboard") as Promise<LeaderboardEntryDTO[]>,
  getHeatmap: () =>
    fetcher("/api/v1/analytics/heatmap") as Promise<HeatmapDataDTO[]>,
  getGeographicDistribution: () =>
    fetcher("/api/v1/analytics/geographic") as Promise<CountryDataDTO[]>,
  getAudienceData: () =>
    fetcher("/api/v1/analytics/audience") as Promise<{
      device: DeviceBreakdownDTO
      browser: BrowserOsDataPoint[]
      os: BrowserOsDataPoint[]
      geographic: CountryDataDTO[]
    }>,
}
