import { Request, Response } from "express";
import { ApiResponse } from "@/shared/utils/api-response";
import { ApiError } from "@/shared/errors/api-error";
import { AsyncHandler } from "@/shared/utils/async-handler";
import { AuthenticatedRequest } from "@/shared/middlewares/requireAuth";
import { PollOwnerRequest } from "@/shared/middlewares/requireCreator";
import * as pollsService from "./polls.service";
import {
  createPollSchema,
  updatePollSchema,
  listPollsQuerySchema
} from "./polls.schema";

export const createPoll = AsyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;

  const parseResult = createPollSchema.safeParse(req.body);

  if (!parseResult.success) {
    throw ApiError.badRequest("Validation failed", parseResult.error.issues);
  }

  const data = parseResult.data;

  const poll = await pollsService.createPoll(authReq.user!.id, {
    title: data.title,
    description: data.description,
    isAnonymous: data.isAnonymous,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    responseGoal: data.responseGoal
  });

  return ApiResponse.created(res, "Poll created successfully", poll);
});

export const getPoll = AsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest("Poll ID is required");
  }

  const poll = await pollsService.getPollById(id as string);

  if (!poll) {
    throw ApiError.notFound("Poll not found");
  }

  return ApiResponse.ok(res, "Poll retrieved successfully", poll);
});

export const listPolls = AsyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;

  const parseResult = listPollsQuerySchema.safeParse(req.query);

  if (!parseResult.success) {
    throw ApiError.badRequest("Validation failed", parseResult.error.issues);
  }

  const result = await pollsService.listPolls(
    authReq.user!.id,
    parseResult.data
  );

  return ApiResponse.ok(res, "Polls retrieved successfully", result);
});

export const updatePoll = AsyncHandler(async (req: Request, res: Response) => {
  const ownerReq = req as PollOwnerRequest;
  const { id } = req.params;

  const parseResult = updatePollSchema.safeParse(req.body);

  if (!parseResult.success) {
    throw ApiError.badRequest("Validation failed", parseResult.error.issues);
  }

  const updatedPoll = await pollsService.updatePoll(
    id as string,
    ownerReq.user!.id,
    parseResult.data
  );

  return ApiResponse.ok(res, "Poll updated successfully", updatedPoll);
});

export const deletePoll = AsyncHandler(async (req: Request, res: Response) => {
  const ownerReq = req as PollOwnerRequest;
  const { id } = req.params;

  await pollsService.deletePoll(id as string, ownerReq.user!.id);

  return ApiResponse.ok(res, "Poll deleted successfully");
});

export const publishPoll = AsyncHandler(async (req: Request, res: Response) => {
  const ownerReq = req as PollOwnerRequest;
  const { id } = req.params;

  const updatedPoll = await pollsService.publishPoll(
    id as string,
    ownerReq.user!.id
  );

  return ApiResponse.ok(res, "Poll published successfully", updatedPoll);
});

export const activatePoll = AsyncHandler(
  async (req: Request, res: Response) => {
    const ownerReq = req as PollOwnerRequest;
    const { id } = req.params;

    const activatedPoll = await pollsService.activatePoll(
      id as string,
      ownerReq.user!.id
    );

    return ApiResponse.ok(res, "Poll activated successfully", activatedPoll);
  }
);

export const closePoll = AsyncHandler(async (req: Request, res: Response) => {
  const ownerReq = req as PollOwnerRequest;
  const { id } = req.params;

  const closedPoll = await pollsService.closePoll(
    id as string,
    ownerReq.user!.id
  );

  return ApiResponse.ok(
    res,
    "Poll closed and published successfully",
    closedPoll
  );
});
