import { Request, Response } from "express";
import { ApiResponse } from "@/shared/utils/api-response";
import { AsyncHandler } from "@/shared/utils/async-handler";
import { AuthenticatedRequest } from "@/shared/middlewares/requireAuth";
import * as questionsService from "./questions.service";
import {
  createQuestionSchema,
  updateQuestionSchema,
  reorderQuestionsSchema,
  createOptionSchema,
  updateOptionSchema,
  reorderOptionsSchema
} from "./questions.schema";

export const createQuestion = AsyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const pollId = req.params.id as string;

    const parseResult = createQuestionSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw new Error(parseResult.error.issues.map(i => i.message).join(", "));
    }

    const newQuestion = await questionsService.createQuestion(
      pollId,
      authReq.user!.id,
      parseResult.data
    );

    return ApiResponse.created(
      res,
      "Question created successfully",
      newQuestion
    );
  }
);

export const listQuestions = AsyncHandler(
  async (req: Request, res: Response) => {
    const pollId = req.params.id as string;

    const questions = await questionsService.listQuestions(pollId);

    return ApiResponse.ok(res, "Questions retrieved successfully", questions);
  }
);

export const updateQuestion = AsyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const questionId = req.params.questionId as string;

    const parseResult = updateQuestionSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw new Error(parseResult.error.issues.map(i => i.message).join(", "));
    }

    const updatedQuestion = await questionsService.updateQuestion(
      questionId,
      authReq.user!.id,
      parseResult.data
    );

    return ApiResponse.ok(
      res,
      "Question updated successfully",
      updatedQuestion
    );
  }
);

export const deleteQuestion = AsyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const questionId = req.params.questionId as string;

    await questionsService.deleteQuestion(questionId, authReq.user!.id);

    return ApiResponse.ok(res, "Question deleted successfully");
  }
);

export const reorderQuestions = AsyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const pollId = req.params.id as string;

    const parseResult = reorderQuestionsSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw new Error(parseResult.error.issues.map(i => i.message).join(", "));
    }

    const reorderedQuestions = await questionsService.reorderQuestions(
      pollId,
      authReq.user!.id,
      parseResult.data
    );

    return ApiResponse.ok(
      res,
      "Questions reordered successfully",
      reorderedQuestions
    );
  }
);

export const createOption = AsyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const questionId = req.params.questionId as string;

    const parseResult = createOptionSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw new Error(parseResult.error.issues.map(i => i.message).join(", "));
    }

    const newOption = await questionsService.createOption(
      questionId,
      authReq.user!.id,
      parseResult.data
    );

    return ApiResponse.created(res, "Option created successfully", newOption);
  }
);

export const listOptions = AsyncHandler(async (req: Request, res: Response) => {
  const questionId = req.params.questionId as string;

  const options = await questionsService.listOptions(questionId);

  return ApiResponse.ok(res, "Options retrieved successfully", options);
});

export const updateOption = AsyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const optionId = req.params.optionId as string;

    const parseResult = updateOptionSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw new Error(parseResult.error.issues.map(i => i.message).join(", "));
    }

    const updatedOption = await questionsService.updateOption(
      optionId,
      authReq.user!.id,
      parseResult.data
    );

    return ApiResponse.ok(res, "Option updated successfully", updatedOption);
  }
);

export const deleteOption = AsyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const optionId = req.params.optionId as string;

    await questionsService.deleteOption(optionId, authReq.user!.id);

    return ApiResponse.ok(res, "Option deleted successfully");
  }
);

export const reorderOptions = AsyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const questionId = req.params.questionId as string;

    const parseResult = reorderOptionsSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw new Error(parseResult.error.issues.map(i => i.message).join(", "));
    }

    const reorderedOptions = await questionsService.reorderOptions(
      questionId,
      authReq.user!.id,
      parseResult.data
    );

    return ApiResponse.ok(
      res,
      "Options reordered successfully",
      reorderedOptions
    );
  }
);
