import { Response } from "express";
import { ApiResponse } from "@/shared/utils/api-response";
import { ApiError } from "@/shared/errors/api-error";
import { AuthenticatedRequest } from "@/shared/middlewares/auth.middleware";

/**
 * Get Current User
 * GET /api/v1/users/me
 * Protected - requires authentication
 */
export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    throw ApiError.unauthorized("User not authenticated");
  }

  return ApiResponse.Success(res, "Current user retrieved successfully", {
    user: req.user,
  });
};
