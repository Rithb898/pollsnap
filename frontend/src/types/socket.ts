export interface ServerToClientEvents {
  "response:new": (data: { pollId: string; totalResponses: number; responseId: string }) => void
  "vote:update": (data: { pollId: string; questionId: string; optionId: string; count: number }) => void
  "poll:closed": (data: { pollId: string }) => void
  connect_error: (error: { message: string }) => void
}

export interface ClientToServerEvents {
  join_poll: (data: { pollId: string }) => void
}

export type SocketNamespace = "/creator" | "/respondent"

export interface SocketState {
  isConnected: boolean
  namespace: SocketNamespace | null
  joinedPolls: string[]
  connectionError: string | null
  setConnected: (connected: boolean) => void
  setNamespace: (namespace: SocketNamespace | null) => void
  addJoinedPoll: (pollId: string) => void
  removeJoinedPoll: (pollId: string) => void
  setConnectionError: (error: string | null) => void
}