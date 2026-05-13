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
  return response.data
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
    return response.data
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
    return response.data
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
    return response.data
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
}

export interface PollDTO {
  id: string
  title: string
  description?: string
  isAnonymous: boolean
  expiresAt?: string
  responseGoal?: number
  status: "draft" | "published"
  createdAt: string
  updatedAt: string
  responseCount?: number
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