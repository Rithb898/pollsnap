import { Server, Socket } from "socket.io";
import db from "@/db/db";
import { poll, pollStatusEnum } from "@/drizzle/schemas/poll.schema";
import { eq, and } from "drizzle-orm";
import { joinRespondentRoom, leaveRespondentRoom } from "./rooms";
import { SocketErrorPayload } from "./events";

interface RespondentSocket extends Socket {
  pollId?: string;
}

const ACTIVE_POLL_STATUSES: Array<"active" | "closed" | "published"> = [
  "active",
  "closed",
  "published"
];

export const setupRespondentNamespace = (io: Server): void => {
  const respondentNs = io.of("/respondent");

  respondentNs.use(async (socket, next) => {
    const respondentSocket = socket as RespondentSocket;

    const pollId = socket.handshake.query.pollId as string;

    if (!pollId) {
      const error: SocketErrorPayload = { message: "Poll ID required" };
      return next(new Error(JSON.stringify(error)));
    }

    try {
      const [pollData] = await db
        .select()
        .from(poll)
        .where(eq(poll.id, pollId))
        .limit(1);

      if (!pollData) {
        const error: SocketErrorPayload = { message: "Poll not found" };
        return next(new Error(JSON.stringify(error)));
      }

      const isValidStatus = ACTIVE_POLL_STATUSES.includes(
        pollData.status as "active" | "closed" | "published"
      );

      respondentSocket.pollId = pollId;
      (
        respondentSocket as RespondentSocket & { pollStatus?: string }
      ).pollStatus = pollData.status;
      next();
    } catch (err) {
      const error: SocketErrorPayload = { message: "Failed to verify poll" };
      next(new Error(JSON.stringify(error)));
    }
  });

  respondentNs.on("connection", (socket: RespondentSocket) => {
    const pollId = socket.pollId;

    if (pollId) {
      joinRespondentRoom(socket, pollId);
      console.log(`Respondent connected to poll: ${pollId}`);
    }

    socket.on("disconnect", () => {
      if (pollId) {
        leaveRespondentRoom(socket, pollId);
        console.log(`Respondent disconnected from poll: ${pollId}`);
      }
    });

    socket.on("join", (requestedPollId: string) => {
      if (requestedPollId === pollId) {
        joinRespondentRoom(socket, requestedPollId);
      }
    });

    socket.on("leave", (requestedPollId: string) => {
      if (requestedPollId === pollId) {
        leaveRespondentRoom(socket, requestedPollId);
      }
    });
  });
};
