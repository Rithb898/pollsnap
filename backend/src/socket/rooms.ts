export const getCreatorRoom = (pollId: string): string =>
  `poll:${pollId}:creator`;

export const getRespondentRoom = (pollId: string): string =>
  `poll:${pollId}:respondent`;

export const joinCreatorRoom = (
  socket: { join: (room: string) => void },
  pollId: string
): void => {
  socket.join(getCreatorRoom(pollId));
};

export const joinRespondentRoom = (
  socket: { join: (room: string) => void },
  pollId: string
): void => {
  socket.join(getRespondentRoom(pollId));
};

export const leaveCreatorRoom = (
  socket: { leave: (room: string) => void },
  pollId: string
): void => {
  socket.leave(getCreatorRoom(pollId));
};

export const leaveRespondentRoom = (
  socket: { leave: (room: string) => void },
  pollId: string
): void => {
  socket.leave(getRespondentRoom(pollId));
};

export const emitToCreatorRoom = (
  io: {
    to: (room: string) => { emit: (event: string, data: unknown) => void };
  },
  pollId: string,
  event: string,
  data: unknown
): void => {
  io.to(getCreatorRoom(pollId)).emit(event, data);
};

export const emitToRespondentRoom = (
  io: {
    to: (room: string) => { emit: (event: string, data: unknown) => void };
  },
  pollId: string,
  event: string,
  data: unknown
): void => {
  io.to(getRespondentRoom(pollId)).emit(event, data);
};

export const emitToBothRooms = (
  io: {
    to: (room: string) => { emit: (event: string, data: unknown) => void };
  },
  pollId: string,
  event: string,
  data: unknown
): void => {
  emitToCreatorRoom(io, pollId, event, data);
  emitToRespondentRoom(io, pollId, event, data);
};
