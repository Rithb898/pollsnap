import { Request, Response } from "express";
import { ApiResponse } from "@/shared/utils/api-response";
import { AsyncHandler } from "@/shared/utils/async-handler";
import { AuthenticatedRequest } from "@/shared/middlewares/requireAuth";
import * as analyticsService from "./analytics.service";

export const getAnalytics = AsyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const pollId = req.params.id as string;

    const analytics = await analyticsService.getPollAnalytics(pollId);

    return ApiResponse.ok(res, "Analytics retrieved successfully", analytics);
  }
);

export const getResults = AsyncHandler(async (req: Request, res: Response) => {
  const pollId = req.params.id as string;

  const results = await analyticsService.getPollResults(pollId);

  return ApiResponse.ok(res, "Results retrieved successfully", results);
});
