import db from "@/db/db";
import {
  poll,
  question,
  option,
  response,
  responseAnswer,
  user
} from "@/drizzle";
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
  recentVotes: {
    id: string;
    time: string;
    respondent: {
      id: string;
      displayName: string;
      email: string;
    } | null;
  }[];
  audience: {
    geographic: {
      country: string;
      code: string;
      count: number;
      percentage: number;
    }[];
    devices: {
      type: string;
      count: number;
      percentage: number;
    }[];
  };
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

  if (existingPoll.status !== "active" && existingPoll.status !== "closed") {
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

  const recentResponsesQuery = await db
    .select({
      id: response.id,
      submittedAt: response.submittedAt,
      respondentId: response.respondentId,
      respondentName: user.name,
      respondentEmail: user.email
    })
    .from(response)
    .leftJoin(user, eq(response.respondentId, user.id))
    .where(eq(response.pollId, pollId))
    .orderBy(sql`${response.submittedAt} DESC`)
    .limit(10);

  const recentVotes = recentResponsesQuery.map(r => ({
    id: r.id,
    time: r.submittedAt.toISOString(),
    respondent: r.respondentId
      ? {
          id: r.respondentId,
          displayName:
            r.respondentName || r.respondentEmail || "Authenticated respondent",
          email: r.respondentEmail || ""
        }
      : null
  }));

  const geographicQuery = await db
    .select({
      countryCode: response.countryCode,
      count: sql<number>`count(*)::int`
    })
    .from(response)
    .where(eq(response.pollId, pollId))
    .groupBy(response.countryCode)
    .orderBy(sql`count(*) DESC`);

  const geographic = geographicQuery.map(g => ({
    country: g.countryCode || "Unknown",
    code: g.countryCode || "XX",
    count: g.count,
    percentage: totalResponses > 0 ? (g.count / totalResponses) * 100 : 0
  }));

  const deviceQuery = await db
    .select({
      type: response.deviceType,
      count: sql<number>`count(*)::int`
    })
    .from(response)
    .where(eq(response.pollId, pollId))
    .groupBy(response.deviceType)
    .orderBy(sql`count(*) DESC`);

  const devices = deviceQuery.map(d => ({
    type: d.type || "unknown",
    count: d.count,
    percentage: totalResponses > 0 ? (d.count / totalResponses) * 100 : 0
  }));

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
    questions: questionsAnalytics,
    recentVotes,
    audience: {
      geographic,
      devices
    }
  };
};

export const getPollResults = async (pollId: string): Promise<PollResults> => {
  const [existingPoll] = await db
    .select()
    .from(poll)
    .where(and(eq(poll.id, pollId), isNull(poll.deletedAt)))
    .limit(1);

  if (!existingPoll || !["active", "closed"].includes(existingPoll.status)) {
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
