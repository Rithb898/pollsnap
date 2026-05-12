import db from "@/db/db";
import { poll, question, option, response, responseAnswer } from "@/drizzle";
import { eq, and, isNull, sql } from "drizzle-orm";
import { ApiError } from "@/shared/errors/api-error";

export interface QuestionAnalytics {
  id: string;
  text: string;
  isMandatory: boolean;
  totalAnswers: number;
  options: {
    id: string;
    text: string;
    count: number;
    percentage: number;
  }[];
}

export interface PollAnalytics {
  poll: {
    id: string;
    title: string;
    description: string | null;
    responseGoal: number | null;
    status: string;
  };
  totalResponses: number;
  goalProgress: number | null;
  completionRate: number;
  questions: QuestionAnalytics[];
}

export interface PollResults {
  poll: {
    id: string;
    title: string;
    description: string | null;
  };
  totalResponses: number;
  questions: QuestionAnalytics[];
}

export const getPollAnalytics = async (
  pollId: string
): Promise<PollAnalytics> => {
  const [existingPoll] = await db
    .select()
    .from(poll)
    .where(and(eq(poll.id, pollId), isNull(poll.deletedAt)))
    .limit(1);

  if (!existingPoll) {
    throw ApiError.notFound("Poll not found");
  }

  if (existingPoll.status !== "active" && existingPoll.status !== "published") {
    throw ApiError.badRequest("Analytics not available for this poll status");
  }

  const [responseCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(response)
    .where(eq(response.pollId, pollId));

  const totalResponses = responseCount.count;

  const questionsList = await db
    .select()
    .from(question)
    .where(eq(question.pollId, pollId))
    .orderBy(question.orderIndex);

  const questionsAnalytics: QuestionAnalytics[] = await Promise.all(
    questionsList.map(async q => {
      const optionsList = await db
        .select()
        .from(option)
        .where(eq(option.questionId, q.id))
        .orderBy(option.orderIndex);

      const optionsWithCounts = await Promise.all(
        optionsList.map(async o => {
          const [countResult] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(responseAnswer)
            .where(
              and(
                eq(responseAnswer.questionId, q.id),
                eq(responseAnswer.optionId, o.id)
              )
            );
          return {
            ...o,
            count: countResult.count
          };
        })
      );

      const totalAnswers = optionsWithCounts.reduce(
        (sum, o) => sum + o.count,
        0
      );

      return {
        id: q.id,
        text: q.text,
        isMandatory: q.isMandatory,
        totalAnswers,
        options: optionsWithCounts.map(o => ({
          id: o.id,
          text: o.text,
          count: o.count,
          percentage: totalAnswers > 0 ? (o.count / totalAnswers) * 100 : 0
        }))
      };
    })
  );

  const [answerCountResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(responseAnswer)
    .where(
      sql`${responseAnswer.responseId} IN (${db.select({ id: response.id }).from(response).where(eq(response.pollId, pollId))})`
    );

  const totalAnswers = answerCountResult.count;
  const completionRate = totalResponses > 0 ? totalAnswers / totalResponses : 0;

  const goalProgress =
    existingPoll.responseGoal && existingPoll.responseGoal > 0
      ? (totalResponses / existingPoll.responseGoal) * 100
      : null;

  return {
    poll: {
      id: existingPoll.id,
      title: existingPoll.title,
      description: existingPoll.description,
      responseGoal: existingPoll.responseGoal,
      status: existingPoll.status
    },
    totalResponses,
    goalProgress,
    completionRate,
    questions: questionsAnalytics
  };
};

export const getPollResults = async (pollId: string): Promise<PollResults> => {
  const [existingPoll] = await db
    .select()
    .from(poll)
    .where(and(eq(poll.id, pollId), isNull(poll.deletedAt)))
    .limit(1);

  if (!existingPoll || existingPoll.status !== "published") {
    throw ApiError.notFound("Poll not found");
  }

  const [responseCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(response)
    .where(eq(response.pollId, pollId));

  const totalResponses = responseCount.count;

  const questionsList = await db
    .select()
    .from(question)
    .where(eq(question.pollId, pollId))
    .orderBy(question.orderIndex);

  const questionsAnalytics: QuestionAnalytics[] = await Promise.all(
    questionsList.map(async q => {
      const optionsList = await db
        .select()
        .from(option)
        .where(eq(option.questionId, q.id))
        .orderBy(option.orderIndex);

      const optionsWithCounts = await Promise.all(
        optionsList.map(async o => {
          const [countResult] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(responseAnswer)
            .where(
              and(
                eq(responseAnswer.questionId, q.id),
                eq(responseAnswer.optionId, o.id)
              )
            );
          return {
            ...o,
            count: countResult.count
          };
        })
      );

      const totalAnswers = optionsWithCounts.reduce(
        (sum, o) => sum + o.count,
        0
      );

      return {
        id: q.id,
        text: q.text,
        isMandatory: q.isMandatory,
        totalAnswers,
        options: optionsWithCounts.map(o => ({
          id: o.id,
          text: o.text,
          count: o.count,
          percentage: totalAnswers > 0 ? (o.count / totalAnswers) * 100 : 0
        }))
      };
    })
  );

  return {
    poll: {
      id: existingPoll.id,
      title: existingPoll.title,
      description: existingPoll.description
    },
    totalResponses,
    questions: questionsAnalytics
  };
};
