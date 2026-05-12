import db from "@/db/db";
import { poll, question, option, response, responseAnswer } from "@/drizzle";
import { eq, and, isNull, sql, count } from "drizzle-orm";
import { ApiError } from "@/shared/errors/api-error";
import type { SubmitResponseInput } from "./responses.schema";
import { emitResponseNew, emitVoteUpdate } from "@/lib/socket-emitter";

export const submitResponse = async (
  pollId: string,
  userId: string | null,
  sessionToken: string | null,
  data: SubmitResponseInput
) => {
  const [existingPoll] = await db
    .select()
    .from(poll)
    .where(and(eq(poll.id, pollId), isNull(poll.deletedAt)))
    .limit(1);

  if (!existingPoll) {
    throw ApiError.notFound("Poll not found");
  }

  if (existingPoll.status !== "active") {
    throw ApiError.badRequest("Poll is not accepting responses");
  }

  if (existingPoll.expiresAt && new Date(existingPoll.expiresAt) < new Date()) {
    throw ApiError.badRequest("Poll has expired");
  }

  if (!existingPoll.isAnonymous && !userId) {
    throw ApiError.unauthorized("Authentication required for this poll");
  }

  if (existingPoll.isAnonymous) {
    if (sessionToken) {
      const [existingResponse] = await db
        .select()
        .from(response)
        .where(
          and(
            eq(response.pollId, pollId),
            eq(response.sessionToken, sessionToken)
          )
        )
        .limit(1);

      if (existingResponse) {
        throw ApiError.badRequest(
          "You have already submitted a response to this poll"
        );
      }
    }
  } else {
    if (userId) {
      const [existingResponse] = await db
        .select()
        .from(response)
        .where(
          and(eq(response.pollId, pollId), eq(response.respondentId, userId))
        )
        .limit(1);

      if (existingResponse) {
        throw ApiError.badRequest(
          "You have already submitted a response to this poll"
        );
      }
    }
  }

  const questions = await db
    .select()
    .from(question)
    .where(eq(question.pollId, pollId));

  const mandatoryQuestions = questions.filter(q => q.isMandatory);
  const answeredQuestionIds = data.answers.map(a => a.questionId);

  const unansweredMandatory = mandatoryQuestions.filter(
    mq => !answeredQuestionIds.includes(mq.id)
  );

  if (unansweredMandatory.length > 0) {
    throw ApiError.badRequest(
      `Please answer all mandatory questions. Missing: ${unansweredMandatory.map(q => q.text).join(", ")}`
    );
  }

  for (const answer of data.answers) {
    const [questionExists] = await db
      .select()
      .from(question)
      .where(
        and(eq(question.id, answer.questionId), eq(question.pollId, pollId))
      )
      .limit(1);

    if (!questionExists) {
      throw ApiError.badRequest(
        `Question ${answer.questionId} not found in this poll`
      );
    }

    const [optionExists] = await db
      .select()
      .from(option)
      .where(
        and(
          eq(option.id, answer.optionId),
          eq(option.questionId, answer.questionId)
        )
      )
      .limit(1);

    if (!optionExists) {
      throw ApiError.badRequest(
        `Option ${answer.optionId} not found for question`
      );
    }
  }

  const [newResponse] = await db
    .insert(response)
    .values({
      pollId,
      respondentId: existingPoll.isAnonymous ? null : userId,
      sessionToken: existingPoll.isAnonymous ? sessionToken : null
    })
    .returning();

  const answerInserts = data.answers.map(answer => ({
    responseId: newResponse.id,
    questionId: answer.questionId,
    optionId: answer.optionId
  }));

  await db.insert(responseAnswer).values(answerInserts);

  const [createdResponse] = await db
    .select()
    .from(response)
    .where(eq(response.id, newResponse.id))
    .limit(1);

  const totalResponsesResult = await db
    .select({ count: count() })
    .from(response)
    .where(eq(response.pollId, pollId));
  const totalResponses = totalResponsesResult[0]?.count || 0;

  emitResponseNew(pollId, totalResponses, createdResponse.id);

  for (const answer of data.answers) {
    const voteCountResult = await db
      .select({ count: count() })
      .from(responseAnswer)
      .where(eq(responseAnswer.optionId, answer.optionId));
    const voteCount = voteCountResult[0]?.count || 0;

    emitVoteUpdate(
      pollId,
      answer.questionId,
      answer.optionId,
      voteCount,
      totalResponses
    );
  }

  return createdResponse;
};
