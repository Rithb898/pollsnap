import { Router } from "express";
import { requireAuth } from "@/shared/middlewares/requireAuth";
import { requireCreator } from "@/shared/middlewares/requireCreator";
import { getAnalytics } from "./analytics.controller";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /polls/{pollId}/analytics:
 *   get:
 *     summary: Get poll analytics
 *     description: Get detailed analytics for a poll (creator only, active/closed polls only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Analytics data, including recent vote identities for non-anonymous polls
 *       400:
 *         description: Poll not active or published
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not creator)
 *       404:
 *         description: Poll not found
 */
router.get("/", requireAuth, requireCreator, getAnalytics);

export default router;
