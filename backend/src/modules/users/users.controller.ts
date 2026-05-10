import { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/lib/auth";
import { ApiResponse } from "@/shared/utils/api-response";

/**
 * Get current authenticated user
 * GET /api/v1/users/me
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });

  if (!session) {
    return ApiResponse.Success(res, "Unauthorized", null, 401);
  }

  return ApiResponse.Success(res, "User session retrieved", session);
};
