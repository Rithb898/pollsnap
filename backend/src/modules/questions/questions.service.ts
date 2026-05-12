import db from "@/db/db";
import { question, option, poll, responseAnswer, response } from "@/drizzle";
import { eq, and, isNull, sql, count } from "drizzle-orm";
import { ApiError } from "@/shared/errors/api-error";
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  ReorderQuestionsInput,
  CreateOptionInput,
  UpdateOptionInput,
  ReorderOptionsInput
} from "./questions.schema";

export const createQuestion = async (
  pollId: string,
  userId: string,
  data: CreateQuestionInput
) => {
  const [existingPoll] = await db
    .select()
    .from(poll)
    .where(and(eq(poll.id, pollId), isNull(poll.deletedAt)))
    .limit(1);

  if (!existingPoll) {
    throw ApiError.notFound("Poll not found");
  }

  if (existingPoll.creatorId !== userId) {
    throw ApiError.forbidden("You are not the creator of this poll");
  }

  if (existingPoll.status !== "draft") {
    throw ApiError.badRequest("Questions can only be added to draft polls");
  }

  const [maxOrder] = await db
    .select({
      maxOrder: sql<number>`coalesce(max(${question.orderIndex}), -1)::int`
    })
    .from(question)
    .where(eq(question.pollId, pollId));

  const newOrder = (maxOrder.maxOrder ?? -1) + 1;

  const [newQuestion] = await db
    .insert(question)
    .values({
      pollId,
      text: data.text,
      isMandatory: data.isMandatory ?? true,
      orderIndex: newOrder
    })
    .returning();

  return newQuestion;
};

export const listQuestions = async (pollId: string) => {
  const questionsList = await db
    .select()
    .from(question)
    .where(eq(question.pollId, pollId))
    .orderBy(question.orderIndex);

  return questionsList;
};

export const getQuestionById = async (questionId: string) => {
  const [foundQuestion] = await db
    .select()
    .from(question)
    .where(eq(question.id, questionId))
    .limit(1);

  return foundQuestion ?? null;
};

export const updateQuestion = async (
  questionId: string,
  userId: string,
  data: UpdateQuestionInput
) => {
  const existingQuestion = await getQuestionById(questionId);

  if (!existingQuestion) {
    throw ApiError.notFound("Question not found");
  }

  const [pollRecord] = await db
    .select()
    .from(poll)
    .where(and(eq(poll.id, existingQuestion.pollId), isNull(poll.deletedAt)))
    .limit(1);

  if (!pollRecord) {
    throw ApiError.notFound("Poll not found");
  }

  if (pollRecord.creatorId !== userId) {
    throw ApiError.forbidden("You are not the creator of this poll");
  }

  if (pollRecord.status !== "draft") {
    throw ApiError.badRequest("Questions can only be updated in draft polls");
  }

  const updateData: Record<string, unknown> = {};
  if (data.text !== undefined) updateData.text = data.text;
  if (data.isMandatory !== undefined) updateData.isMandatory = data.isMandatory;

  const [updatedQuestion] = await db
    .update(question)
    .set(updateData)
    .where(eq(question.id, questionId))
    .returning();

  return updatedQuestion;
};

export const deleteQuestion = async (questionId: string, userId: string) => {
  const existingQuestion = await getQuestionById(questionId);

  if (!existingQuestion) {
    throw ApiError.notFound("Question not found");
  }

  const [pollRecord] = await db
    .select()
    .from(poll)
    .where(and(eq(poll.id, existingQuestion.pollId), isNull(poll.deletedAt)))
    .limit(1);

  if (!pollRecord) {
    throw ApiError.notFound("Poll not found");
  }

  if (pollRecord.creatorId !== userId) {
    throw ApiError.forbidden("You are not the creator of this poll");
  }

  if (pollRecord.status !== "draft") {
    throw ApiError.badRequest("Questions can only be deleted from draft polls");
  }

  const [responseCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(response)
    .where(eq(response.pollId, pollRecord.id));

  if (responseCount.count > 0) {
    throw ApiError.badRequest("Cannot delete question with responses");
  }

  const [deletedQuestion] = await db
    .delete(question)
    .where(eq(question.id, questionId))
    .returning();

  return deletedQuestion;
};

export const reorderQuestions = async (
  pollId: string,
  userId: string,
  data: ReorderQuestionsInput
) => {
  const [pollRecord] = await db
    .select()
    .from(poll)
    .where(and(eq(poll.id, pollId), isNull(poll.deletedAt)))
    .limit(1);

  if (!pollRecord) {
    throw ApiError.notFound("Poll not found");
  }

  if (pollRecord.creatorId !== userId) {
    throw ApiError.forbidden("You are not the creator of this poll");
  }

  if (pollRecord.status !== "draft") {
    throw ApiError.badRequest("Questions can only be reordered in draft polls");
  }

  const existingQuestions = await db
    .select({ id: question.id })
    .from(question)
    .where(eq(question.pollId, pollId));

  const existingIds = existingQuestions.map(q => q.id);
  const providedIds = data.questionIds;

  if (providedIds.length !== existingIds.length) {
    throw ApiError.badRequest("Must provide all question IDs");
  }

  const missingIds = providedIds.filter(id => !existingIds.includes(id));
  if (missingIds.length > 0) {
    throw ApiError.badRequest("Invalid question IDs provided");
  }

  for (let i = 0; i < providedIds.length; i++) {
    await db
      .update(question)
      .set({ orderIndex: i })
      .where(eq(question.id, providedIds[i]));
  }

  const reorderedQuestions = await db
    .select()
    .from(question)
    .where(eq(question.pollId, pollId))
    .orderBy(question.orderIndex);

  return reorderedQuestions;
};

export const createOption = async (
  questionId: string,
  userId: string,
  data: CreateOptionInput
) => {
  const existingQuestion = await getQuestionById(questionId);

  if (!existingQuestion) {
    throw ApiError.notFound("Question not found");
  }

  const [pollRecord] = await db
    .select()
    .from(poll)
    .where(and(eq(poll.id, existingQuestion.pollId), isNull(poll.deletedAt)))
    .limit(1);

  if (!pollRecord) {
    throw ApiError.notFound("Poll not found");
  }

  if (pollRecord.creatorId !== userId) {
    throw ApiError.forbidden("You are not the creator of this poll");
  }

  if (pollRecord.status !== "draft") {
    throw ApiError.badRequest("Options can only be added to draft polls");
  }

  const existingOptions = await db
    .select()
    .from(option)
    .where(eq(option.questionId, questionId));

  const duplicateOption = existingOptions.find(
    o => o.text.toLowerCase() === data.text.toLowerCase()
  );
  if (duplicateOption) {
    throw ApiError.badRequest("Option with same text already exists");
  }

  const [maxOrder] = await db
    .select({
      maxOrder: sql<number>`coalesce(max(${option.orderIndex}), -1)::int`
    })
    .from(option)
    .where(eq(option.questionId, questionId));

  const newOrder = (maxOrder.maxOrder ?? -1) + 1;

  const [newOption] = await db
    .insert(option)
    .values({
      questionId,
      text: data.text,
      orderIndex: newOrder
    })
    .returning();

  return newOption;
};

export const listOptions = async (questionId: string) => {
  const optionsList = await db
    .select()
    .from(option)
    .where(eq(option.questionId, questionId))
    .orderBy(option.orderIndex);

  return optionsList;
};

export const getOptionById = async (optionId: string) => {
  const [foundOption] = await db
    .select()
    .from(option)
    .where(eq(option.id, optionId))
    .limit(1);

  return foundOption ?? null;
};

export const updateOption = async (
  optionId: string,
  userId: string,
  data: UpdateOptionInput
) => {
  const existingOption = await getOptionById(optionId);

  if (!existingOption) {
    throw ApiError.notFound("Option not found");
  }

  const existingQuestion = await getQuestionById(existingOption.questionId);
  if (!existingQuestion) {
    throw ApiError.notFound("Question not found");
  }

  const [pollRecord] = await db
    .select()
    .from(poll)
    .where(and(eq(poll.id, existingQuestion.pollId), isNull(poll.deletedAt)))
    .limit(1);

  if (!pollRecord) {
    throw ApiError.notFound("Poll not found");
  }

  if (pollRecord.creatorId !== userId) {
    throw ApiError.forbidden("You are not the creator of this poll");
  }

  if (pollRecord.status !== "draft") {
    throw ApiError.badRequest("Options can only be updated in draft polls");
  }

  const existingOptions = await db
    .select()
    .from(option)
    .where(eq(option.questionId, existingOption.questionId));

  const duplicateOption = existingOptions.find(
    o => o.text.toLowerCase() === data.text.toLowerCase() && o.id !== optionId
  );
  if (duplicateOption) {
    throw ApiError.badRequest("Option with same text already exists");
  }

  const [updatedOption] = await db
    .update(option)
    .set({ text: data.text })
    .where(eq(option.id, optionId))
    .returning();

  return updatedOption;
};

export const deleteOption = async (optionId: string, userId: string) => {
  const existingOption = await getOptionById(optionId);

  if (!existingOption) {
    throw ApiError.notFound("Option not found");
  }

  const existingQuestion = await getQuestionById(existingOption.questionId);
  if (!existingQuestion) {
    throw ApiError.notFound("Question not found");
  }

  const [pollRecord] = await db
    .select()
    .from(poll)
    .where(and(eq(poll.id, existingQuestion.pollId), isNull(poll.deletedAt)))
    .limit(1);

  if (!pollRecord) {
    throw ApiError.notFound("Poll not found");
  }

  if (pollRecord.creatorId !== userId) {
    throw ApiError.forbidden("You are not the creator of this poll");
  }

  if (pollRecord.status !== "draft") {
    throw ApiError.badRequest("Options can only be deleted from draft polls");
  }

  const [answerCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(responseAnswer)
    .where(eq(responseAnswer.optionId, optionId));

  if (answerCount.count > 0) {
    throw ApiError.badRequest("Cannot delete option with responses");
  }

  const [deletedOption] = await db
    .delete(option)
    .where(eq(option.id, optionId))
    .returning();

  return deletedOption;
};

export const reorderOptions = async (
  questionId: string,
  userId: string,
  data: ReorderOptionsInput
) => {
  const existingQuestion = await getQuestionById(questionId);

  if (!existingQuestion) {
    throw ApiError.notFound("Question not found");
  }

  const [pollRecord] = await db
    .select()
    .from(poll)
    .where(and(eq(poll.id, existingQuestion.pollId), isNull(poll.deletedAt)))
    .limit(1);

  if (!pollRecord) {
    throw ApiError.notFound("Poll not found");
  }

  if (pollRecord.creatorId !== userId) {
    throw ApiError.forbidden("You are not the creator of this poll");
  }

  if (pollRecord.status !== "draft") {
    throw ApiError.badRequest("Options can only be reordered in draft polls");
  }

  const existingOptions = await db
    .select({ id: option.id })
    .from(option)
    .where(eq(option.questionId, questionId));

  const existingIds = existingOptions.map(o => o.id);
  const providedIds = data.optionIds;

  if (providedIds.length !== existingIds.length) {
    throw ApiError.badRequest("Must provide all option IDs");
  }

  const missingIds = providedIds.filter(id => !existingIds.includes(id));
  if (missingIds.length > 0) {
    throw ApiError.badRequest("Invalid option IDs provided");
  }

  for (let i = 0; i < providedIds.length; i++) {
    await db
      .update(option)
      .set({ orderIndex: i })
      .where(eq(option.id, providedIds[i]));
  }

  const reorderedOptions = await db
    .select()
    .from(option)
    .where(eq(option.questionId, questionId))
    .orderBy(option.orderIndex);

  return reorderedOptions;
};
