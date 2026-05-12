import db from "@/db/db";
import { poll, pollStatusEnum, question, option } from "@/drizzle";
import { eq, and, isNull, desc, sql } from "drizzle-orm";
import { ApiError } from "@/shared/errors/api-error";
import type {
  CreatePollInput,
  UpdatePollInput,
  ListPollsQuery
} from "./polls.schema";

export interface CreatePollData {
  title: string;
  description?: string;
  isAnonymous?: boolean;
  expiresAt?: Date | null;
  responseGoal?: number | null;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListPollsResult {
  data: (typeof poll.$inferSelect)[];
  pagination: PaginationResult;
}

export const createPoll = async (userId: string, data: CreatePollData) => {
  const [newPoll] = await db
    .insert(poll)
    .values({
      creatorId: userId,
      title: data.title,
      description: data.description ?? null,
      isAnonymous: data.isAnonymous ?? false,
      expiresAt: data.expiresAt ?? null,
      responseGoal: data.responseGoal ?? null,
      status: "draft"
    })
    .returning();

  return newPoll;
};

export const getPollById = async (id: string) => {
  const [foundPoll] = await db
    .select()
    .from(poll)
    .where(and(eq(poll.id, id), isNull(poll.deletedAt)))
    .limit(1);

  return foundPoll ?? null;
};

export const listPolls = async (
  userId: string,
  query: ListPollsQuery
): Promise<ListPollsResult> => {
  const { page, limit, status } = query;
  const offset = (page - 1) * limit;

  const conditions = [eq(poll.creatorId, userId), isNull(poll.deletedAt)];

  if (status) {
    conditions.push(
      eq(poll.status, status as (typeof pollStatusEnum.enumValues)[number])
    );
  }

  const whereClause = and(...conditions);

  const polls = await db
    .select()
    .from(poll)
    .where(whereClause)
    .orderBy(desc(poll.createdAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(poll)
    .where(whereClause);

  const total = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return {
    data: polls,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
};

export const updatePoll = async (
  id: string,
  userId: string,
  data: UpdatePollInput
) => {
  const existingPoll = await getPollById(id);

  if (!existingPoll) {
    throw ApiError.notFound("Poll not found");
  }

  if (existingPoll.creatorId !== userId) {
    throw ApiError.forbidden("You are not the creator of this poll");
  }

  if (existingPoll.status !== "draft") {
    throw ApiError.badRequest("Poll can only be updated when in draft status");
  }

  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.isAnonymous !== undefined) updateData.isAnonymous = data.isAnonymous;
  if (data.expiresAt !== undefined) {
    updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  }
  if (data.responseGoal !== undefined) {
    updateData.responseGoal = data.responseGoal ?? null;
  }

  const [updatedPoll] = await db
    .update(poll)
    .set(updateData)
    .where(eq(poll.id, id))
    .returning();

  return updatedPoll;
};

export const deletePoll = async (id: string, userId: string) => {
  const existingPoll = await getPollById(id);

  if (!existingPoll) {
    throw ApiError.notFound("Poll not found");
  }

  if (existingPoll.creatorId !== userId) {
    throw ApiError.forbidden("You are not the creator of this poll");
  }

  if (existingPoll.status !== "draft") {
    throw ApiError.badRequest("Poll can only be deleted when in draft status");
  }

  const [deletedPoll] = await db
    .update(poll)
    .set({ deletedAt: new Date() })
    .where(eq(poll.id, id))
    .returning();

  return deletedPoll;
};

export const publishPoll = async (id: string, userId: string) => {
  const existingPoll = await getPollById(id);

  if (!existingPoll) {
    throw ApiError.notFound("Poll not found");
  }

  if (existingPoll.creatorId !== userId) {
    throw ApiError.forbidden("You are not the creator of this poll");
  }

  if (existingPoll.status !== "closed") {
    throw ApiError.badRequest(
      "Poll can only be published when in closed status"
    );
  }

  const [publishedPoll] = await db
    .update(poll)
    .set({ status: "published" })
    .where(eq(poll.id, id))
    .returning();

  return publishedPoll;
};

export const activatePoll = async (id: string, userId: string) => {
  const existingPoll = await getPollById(id);

  if (!existingPoll) {
    throw ApiError.notFound("Poll not found");
  }

  if (existingPoll.creatorId !== userId) {
    throw ApiError.forbidden("You are not the creator of this poll");
  }

  if (existingPoll.status !== "draft") {
    throw ApiError.badRequest(
      "Poll can only be activated when in draft status"
    );
  }

  if (!existingPoll.expiresAt) {
    throw ApiError.badRequest("Poll must have an expiry date to be activated");
  }

  const questions = await db
    .select()
    .from(question)
    .where(eq(question.pollId, id));

  if (questions.length === 0) {
    throw ApiError.badRequest(
      "Poll must have at least one question to be activated"
    );
  }

  for (const q of questions) {
    const optionsCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(option)
      .where(eq(option.questionId, q.id));

    if (optionsCount[0].count < 2) {
      throw ApiError.badRequest(
        `Question "${q.text}" must have at least two options to be activated`
      );
    }
  }

  const [activatedPoll] = await db
    .update(poll)
    .set({ status: "active" })
    .where(eq(poll.id, id))
    .returning();

  return activatedPoll;
};

export const closePoll = async (id: string, userId: string) => {
  const existingPoll = await getPollById(id);

  if (!existingPoll) {
    throw ApiError.notFound("Poll not found");
  }

  if (existingPoll.creatorId !== userId) {
    throw ApiError.forbidden("You are not the creator of this poll");
  }

  if (existingPoll.status !== "active") {
    throw ApiError.badRequest("Poll can only be closed when in active status");
  }

  const [closedPoll] = await db
    .update(poll)
    .set({ status: "closed" })
    .where(eq(poll.id, id))
    .returning();

  const [publishedPoll] = await db
    .update(poll)
    .set({ status: "published" })
    .where(eq(poll.id, id))
    .returning();

  return publishedPoll;
};
