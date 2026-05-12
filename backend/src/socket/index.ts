import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import env from "@/shared/configs/env";
import { setupCreatorNamespace } from "./creator";
import { setupRespondentNamespace } from "./respondent";

let io: SocketIOServer | null = null;

export const initializeSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true
    },
    path: "/socket.io"
  });

  if (env.REDIS_URL) {
    try {
      const pubClient = new Redis(env.REDIS_URL);
      const subClient = new Redis(env.REDIS_URL);

      const adapter = createAdapter(pubClient, subClient);
      io.adapter(adapter);
      console.log("Socket.io Redis adapter enabled (Upstash)");
    } catch (error) {
      console.warn("Redis adapter failed, using in-memory:", error);
    }
  } else {
    console.log("Socket.io initialized with in-memory adapter");
  }

  setupCreatorNamespace(io);
  setupRespondentNamespace(io);

  console.log("Socket.io namespaces ready");
  return io;
};

export const getIO = (): SocketIOServer | null => io;