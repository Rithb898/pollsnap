import { Request, Response } from "express"
import { requireAuth, AuthenticatedRequest } from "@/shared/middlewares/requireAuth"
import db from "@/db/db"
import { poll, response, user } from "@/drizzle"
import { eq, and, isNull, sql, gte } from "drizzle-orm"
import { AsyncHandler } from "@/shared/utils/async-handler"
import { ApiResponse } from "@/shared/utils/api-response"
import { Router } from "express"

const router = Router()

router.get(
  "/stats",
  requireAuth,
  AsyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.id

    const pollsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(poll)
      .where(and(eq(poll.creatorId, userId!), isNull(poll.deletedAt)))

    const activePollsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(poll)
      .where(and(eq(poll.creatorId, userId!), eq(poll.status, "active"), isNull(poll.deletedAt)))

    const responsesResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(response)
      .innerJoin(poll, eq(response.pollId, poll.id))
      .where(and(eq(poll.creatorId, userId!), isNull(poll.deletedAt)))

    const goalResult = await db
      .select({ goal: poll.responseGoal, pollId: poll.id })
      .from(poll)
      .where(and(eq(poll.creatorId, userId!), isNull(poll.deletedAt)))

    const totalPolls = pollsResult[0]?.count || 0
    const activePolls = activePollsResult[0]?.count || 0
    const totalResponses = responsesResult[0]?.count || 0

    let completionRate = 0
    const pollsWGoals = goalResult.filter(p => p.goal !== null)
    if (pollsWGoals.length > 0) {
      let totalProgress = 0
      for (const p of pollsWGoals) {
        const pollResponses = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(response)
          .where(eq(response.pollId, p.pollId))
        const actual = pollResponses[0]?.count || 0
        const goal = p.goal || 1
        totalProgress += Math.min(100, Math.round((actual / goal) * 100))
      }
      completionRate = Math.round(totalProgress / pollsWGoals.length)
    } else if (totalPolls > 0) {
      completionRate = totalPolls > 0 ? Math.round((activePolls / totalPolls) * 100) : 0
    }

    return ApiResponse.ok(res, "Dashboard stats fetched successfully", {
      totalPolls,
      activePolls,
      totalResponses,
      completionRate,
    })
  })
)

router.get(
  "/trends",
  requireAuth,
  AsyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.id
    const days = parseInt(req.query.days as string) || 7

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const userPolls = await db
      .select({ id: poll.id })
      .from(poll)
      .where(and(eq(poll.creatorId, userId!), isNull(poll.deletedAt)))

    const pollIds = userPolls.map(p => p.id)

    if (pollIds.length === 0) {
      const emptyData: { date: string; responses: number }[] = []
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        emptyData.push({
          date: date.toISOString().split("T")[0],
          responses: 0,
        })
      }
      return ApiResponse.ok(res, "Trend data fetched successfully", emptyData)
    }

    const trends = await db
      .select({
        date: sql<string>`DATE(${response.submittedAt})`,
        responses: sql<number>`count(*)::int`,
      })
      .from(response)
      .where(
        and(
          sql`${response.pollId} IN ${pollIds}`,
          gte(response.submittedAt, startDate)
        )
      )
      .groupBy(sql`DATE(${response.submittedAt})`)
      .orderBy(sql`DATE(${response.submittedAt})`)

    const trendMap = new Map(trends.map(t => [t.date, t.responses]))

    const data: { date: string; responses: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      data.push({
        date: dateStr,
        responses: trendMap.get(dateStr) || 0,
      })
    }

    return ApiResponse.ok(res, "Trend data fetched successfully", data)
  })
)

router.get(
  "/recent-activity",
  requireAuth,
  AsyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.id

    const recentResponses = await db
      .select({
        id: response.id,
        pollTitle: poll.title,
        timestamp: response.submittedAt,
        userName: user.name,
      })
      .from(response)
      .innerJoin(poll, eq(response.pollId, poll.id))
      .leftJoin(user, eq(response.respondentId, user.id))
      .where(and(eq(poll.creatorId, userId!), isNull(poll.deletedAt)))
      .orderBy(sql`${response.submittedAt} DESC`)
      .limit(5)

    const formattedActivity = recentResponses.map((r, index) => ({
      id: r.id,
      user: r.userName || "Anonymous",
      action: "voted on",
      poll: r.pollTitle,
      time: new Date(r.timestamp).toISOString(),
    }))

    return ApiResponse.ok(res, "Recent activity fetched successfully", formattedActivity)
  })
)

router.get(
  "/audience-insights",
  requireAuth,
  AsyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.id

    const userPolls = await db
      .select({ id: poll.id })
      .from(poll)
      .where(and(eq(poll.creatorId, userId!), isNull(poll.deletedAt)))

    const pollIds = userPolls.map(p => p.id)

    if (pollIds.length === 0) {
      return ApiResponse.ok(res, "Audience insights fetched successfully", {
        mobile: 0,
        desktop: 0,
        tablet: 0
      })
    }

    const deviceCounts = await db
      .select({
        deviceType: response.deviceType,
        count: sql<number>`count(*)::int`
      })
      .from(response)
      .where(sql`${response.pollId} IN ${pollIds}`)
      .groupBy(response.deviceType)

    const total = deviceCounts.reduce((sum, d) => sum + (d.count || 0), 0)
    
    type DeviceType = 'mobile' | 'desktop' | 'tablet' | null
    const getPercentage = (device: DeviceType) => {
      if (total === 0) return 0
      const found = deviceCounts.find(d => d.deviceType === device)
      return found ? Math.round((found.count / total) * 100) : 0
    }

    return ApiResponse.ok(res, "Audience insights fetched successfully", {
      mobile: getPercentage('mobile'),
      desktop: getPercentage('desktop'),
      tablet: getPercentage('tablet')
    })
  })
)

router.get(
  "/plan-usage",
  requireAuth,
  AsyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.id

    const responsesResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(response)
      .innerJoin(poll, eq(response.pollId, poll.id))
      .where(and(eq(poll.creatorId, userId!), isNull(poll.deletedAt)))

    const responsesUsed = responsesResult[0]?.count || 0
    const responsesTotal = 500

    return ApiResponse.ok(res, "Plan usage fetched successfully", {
      responsesUsed,
      responsesTotal
    })
  })
)

export default router
