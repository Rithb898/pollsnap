import { Request, Response } from "express";
import { ApiResponse } from "@/shared/utils/api-response";
import { AsyncHandler } from "@/shared/utils/async-handler";
import { AuthenticatedRequest } from "@/shared/middlewares/requireAuth";
import * as analyticsService from "./global-analytics.service";

export const getTrends = AsyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.id;
  const days = parseInt(req.query.days as string) || 30;

  const trends = await analyticsService.getGlobalTrends(userId!, days);
  return ApiResponse.ok(res, "Trends fetched successfully", trends);
});

export const getDeviceBreakdown = AsyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.id;

  const breakdown = await analyticsService.getDeviceBreakdown(userId!);
  return ApiResponse.ok(res, "Device breakdown fetched successfully", breakdown);
});

export const getBrowserBreakdown = AsyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.id;

  const breakdown = await analyticsService.getBrowserBreakdown(userId!);
  return ApiResponse.ok(res, "Browser breakdown fetched successfully", breakdown);
});

export const getOsBreakdown = AsyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.id;

  const breakdown = await analyticsService.getOsBreakdown(userId!);
  return ApiResponse.ok(res, "OS breakdown fetched successfully", breakdown);
});

export const getLeaderboard = AsyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.id;

  const leaderboard = await analyticsService.getLeaderboard(userId!);
  return ApiResponse.ok(res, "Leaderboard fetched successfully", leaderboard);
});

export const getHeatmap = AsyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.id;

  const heatmap = await analyticsService.getHeatmap(userId!);
  return ApiResponse.ok(res, "Heatmap fetched successfully", heatmap);
});

export const getGeographicDistribution = AsyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.id;

  const geographic = await analyticsService.getGeographicDistribution(userId!);
  return ApiResponse.ok(res, "Geographic distribution fetched successfully", geographic);
});

export const getAudienceData = AsyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.id;

  const [device, browser, os, geographic] = await Promise.all([
    analyticsService.getDeviceBreakdown(userId!),
    analyticsService.getBrowserBreakdown(userId!),
    analyticsService.getOsBreakdown(userId!),
    analyticsService.getGeographicDistribution(userId!),
  ]);

  return ApiResponse.ok(res, "Audience data fetched successfully", {
    device,
    browser,
    os,
    geographic,
  });
});
