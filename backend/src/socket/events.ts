export const SOCKET_EVENTS = {
  RESPONSE_NEW: "response:new",
  VOTE_UPDATE: "vote:update",
  POLL_CLOSED: "poll:closed",
  ERROR: "error"
} as const;

export interface ResponseNewPayload {
  pollId: string;
  totalResponses: number;
  responseId: string;
}

export interface VoteUpdatePayload {
  pollId: string;
  questionId: string;
  optionId: string;
  newCount: number;
  totalResponses: number;
}

export interface PollClosedPayload {
  pollId: string;
}

export interface PollPublishedPayload {
  pollId: string;
}

export interface SocketErrorPayload {
  message: string;
  code?: string;
}

export type CreatorEventPayload =
  | ResponseNewPayload
  | VoteUpdatePayload
  | PollClosedPayload
  | PollPublishedPayload
  | SocketErrorPayload;

export type RespondentEventPayload =
  | VoteUpdatePayload
  | PollClosedPayload
  | PollPublishedPayload
  | SocketErrorPayload;
