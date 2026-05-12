import { Request, Response, NextFunction } from "express";
import db from "@/db/db";
import { poll } from "@/drizzle";
import { eq, and, isNull } from "drizzle-orm";
import { ApiError } from "@/shared/errors/api-error";
import { AuthenticatedRequest } from "./requireAuth";

export interface PollOwnerRequest extends AuthenticatedRequest {
  poll?: typeof poll.$inferSelect;
}

export const requireCreator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const pollId = req.params.id as string;

    if (!authReq.user) {
      throw ApiError.unauthorized("Authentication required");
    }

    if (!pollId) {
      throw ApiError.badRequest("Poll ID is required");
    }

    const [foundPoll] = await db
      .select()
      .from(poll)
      .where(and(eq(poll.id, pollId), isNull(poll.deletedAt)))
      .limit(1);

    if (!foundPoll) {
      throw ApiError.notFound("Poll not found");
    }

    if (foundPoll.creatorId !== authReq.user.id) {
      throw ApiError.forbidden("You are not the creator of this poll");
    }

    (req as PollOwnerRequest).poll = foundPoll;

    next();
  } catch (error) {
    next(error);
  }
};
