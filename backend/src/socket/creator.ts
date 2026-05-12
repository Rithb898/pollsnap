import { Server, Socket } from "socket.io";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/lib/auth";
import db from "@/db/db";
import { poll } from "@/drizzle/schemas/poll.schema";
import { eq } from "drizzle-orm";
import { joinCreatorRoom, leaveCreatorRoom } from "./rooms";
import { SOCKET_EVENTS, SocketErrorPayload } from "./events";

interface CreatorSocket extends Socket {
  pollId?: string;
  userId?: string;
}

export const setupCreatorNamespace = (io: Server): void => {
  const creatorNs = io.of("/creator");

  creatorNs.use(async (socket, next) => {
    const creatorSocket = socket as CreatorSocket;

    const pollId = socket.handshake.query.pollId as string;
    const token = socket.handshake.query.token as string;

    if (!pollId) {
      const error: SocketErrorPayload = { message: "Poll ID required" };
      return next(new Error(JSON.stringify(error)));
    }

    if (!token) {
      const error: SocketErrorPayload = {
        message: "Authentication token required"
      };
      return next(new Error(JSON.stringify(error)));
    }

    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders({
          authorization: `Bearer ${token}`,
          cookie: socket.handshake.headers.cookie || ""
        })
      });

      if (!session) {
        const error: SocketErrorPayload = {
          message: "Invalid or expired token"
        };
        return next(new Error(JSON.stringify(error)));
      }

      const [pollData] = await db
        .select()
        .from(poll)
        .where(eq(poll.id, pollId))
        .limit(1);

      if (!pollData) {
        const error: SocketErrorPayload = { message: "Poll not found" };
        return next(new Error(JSON.stringify(error)));
      }

      if (pollData.creatorId !== session.user.id) {
        const error: SocketErrorPayload = {
          message: "Not authorized to access this poll"
        };
        return next(new Error(JSON.stringify(error)));
      }

      creatorSocket.pollId = pollId;
      creatorSocket.userId = session.user.id;
      next();
    } catch (err) {
      const error: SocketErrorPayload = { message: "Authentication failed" };
      next(new Error(JSON.stringify(error)));
    }
  });

  creatorNs.on("connection", (socket: CreatorSocket) => {
    const pollId = socket.pollId;

    if (pollId) {
      joinCreatorRoom(socket, pollId);
      console.log(`Creator connected to poll: ${pollId}`);
    }

    socket.on("disconnect", () => {
      if (pollId) {
        leaveCreatorRoom(socket, pollId);
        console.log(`Creator disconnected from poll: ${pollId}`);
      }
    });

    socket.on("join", (requestedPollId: string) => {
      if (requestedPollId === pollId) {
        joinCreatorRoom(socket, requestedPollId);
      }
    });

    socket.on("leave", (requestedPollId: string) => {
      if (requestedPollId === pollId) {
        leaveCreatorRoom(socket, requestedPollId);
      }
    });
  });
};
