import { Request, Response } from "express";
import { ApiResponse } from "@/shared/utils/api-response";
import { ApiError } from "@/shared/errors/api-error";
import { AsyncHandler } from "@/shared/utils/async-handler";
import { AuthenticatedRequest } from "@/shared/middlewares/requireAuth";
import * as responsesService from "./responses.service";
import { submitResponseSchema } from "./responses.schema";

export const submitResponse = AsyncHandler(
  async (req: Request, res: Response) => {
    const pollId = req.params.id as string;
    const authReq = req as AuthenticatedRequest;

    const userId = authReq.user?.id ?? null;
    const sessionToken = req.cookies?.session_token ?? null;

    const parseResult = submitResponseSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw ApiError.badRequest(
        "Validation failed",
        parseResult.error.issues.map(i => ({
          message: i.message,
          path: i.path
        }))
      );
    }

    const response = await responsesService.submitResponse(
      pollId,
      userId,
      sessionToken,
      parseResult.data
    );

    if (!response) {
      throw ApiError.badRequest("Failed to create response");
    }

    return ApiResponse.created(
      res,
      "Response submitted successfully",
      response
    );
  }
);
