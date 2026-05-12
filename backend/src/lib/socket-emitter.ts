import { getIO } from "@/socket";
import {
  emitToCreatorRoom,
  emitToRespondentRoom,
  emitToBothRooms
} from "@/socket/rooms";
import {
  SOCKET_EVENTS,
  ResponseNewPayload,
  VoteUpdatePayload,
  PollClosedPayload,
  PollPublishedPayload
} from "@/socket/events";

export const emitResponseNew = (
  pollId: string,
  totalResponses: number,
  responseId: string
): void => {
  const io = getIO();
  if (!io) return;

  const payload: ResponseNewPayload = { pollId, totalResponses, responseId };
  emitToCreatorRoom(io, pollId, SOCKET_EVENTS.RESPONSE_NEW, payload);
};

export const emitVoteUpdate = (
  pollId: string,
  questionId: string,
  optionId: string,
  newCount: number,
  totalResponses: number
): void => {
  const io = getIO();
  if (!io) return;

  const payload: VoteUpdatePayload = {
    pollId,
    questionId,
    optionId,
    newCount,
    totalResponses
  };
  emitToBothRooms(io, pollId, SOCKET_EVENTS.VOTE_UPDATE, payload);
};

export const emitPollClosed = (pollId: string): void => {
  const io = getIO();
  if (!io) return;

  const payload: PollClosedPayload = { pollId };
  emitToBothRooms(io, pollId, SOCKET_EVENTS.POLL_CLOSED, payload);
};

export const emitPollPublished = (pollId: string): void => {
  const io = getIO();
  if (!io) return;

  const payload: PollPublishedPayload = { pollId };
  emitToBothRooms(io, pollId, SOCKET_EVENTS.POLL_PUBLISHED, payload);
};
