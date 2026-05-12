import { Router } from "express";
import { requireAuth } from "@/shared/middlewares/requireAuth";
import { requireCreator } from "@/shared/middlewares/requireCreator";
import {
  createPoll,
  getPoll,
  listPolls,
  updatePoll,
  deletePoll,
  publishPoll,
  activatePoll,
  closePoll
} from "./polls.controller";
import QuestionsRouter from "../questions/questions.routes";
import ResponsesRouter from "../responses/responses.routes";

const router = Router();

/**
 * @swagger
 * /polls:
 *   get:
 *     summary: List user's polls
 *     description: Get paginated list of polls created by the authenticated user
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, closed, published]
 *     responses:
 *       200:
 *         description: List of polls
 *       401:
 *         description: Unauthorized
 */
router.get("/", requireAuth, listPolls);

/**
 * @swagger
 * /polls:
 *   post:
 *     summary: Create a new poll
 *     description: Create a new poll in draft status
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               isAnonymous:
 *                 type: boolean
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               responseGoal:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Poll created
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
router.post("/", requireAuth, createPoll);

/**
 * @swagger
 * /polls/{id}:
 *   get:
 *     summary: Get poll by ID
 *     description: Get poll metadata (public endpoint)
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Poll data
 *       404:
 *         description: Poll not found
 */
router.get("/:id", getPoll);

/**
 * @swagger
 * /polls/{id}:
 *   patch:
 *     summary: Update poll
 *     description: Update a draft poll (creator only)
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               isAnonymous:
 *                 type: boolean
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               responseGoal:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Poll updated
 *       400:
 *         description: Validation failed or poll not in draft
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not creator)
 *       404:
 *         description: Poll not found
 */
router.patch("/:id", requireAuth, requireCreator, updatePoll);

/**
 * @swagger
 * /polls/{id}:
 *   delete:
 *     summary: Delete poll
 *     description: Soft delete a draft poll (creator only)
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Poll deleted
 *       400:
 *         description: Poll not in draft
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not creator)
 *       404:
 *         description: Poll not found
 */
router.delete("/:id", requireAuth, requireCreator, deletePoll);

/**
 * @swagger
 * /polls/{id}/publish:
 *   patch:
 *     summary: Publish poll
 *     description: Transition poll from closed to published status (creator only)
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Poll published
 *       400:
 *         description: Poll not in closed status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not creator)
 *       404:
 *         description: Poll not found
 */
router.patch("/:id/publish", requireAuth, requireCreator, publishPoll);

/**
 * @swagger
 * /polls/{id}/activate:
 *   post:
 *     summary: Activate poll
 *     description: Transition poll from draft to active status (creator only). Requires at least one question with 2+ options and an expiry date.
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Poll activated
 *       400:
 *         description: Validation failed - poll must have questions with 2+ options and expiry date
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not creator)
 *       404:
 *         description: Poll not found
 */
router.post("/:id/activate", requireAuth, requireCreator, activatePoll);

/**
 * @swagger
 * /polls/{id}/close:
 *   post:
 *     summary: Close poll
 *     description: Transition poll from active to closed, then published immediately (creator only)
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Poll closed and published
 *       400:
 *         description: Poll not in active status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not creator)
 *       404:
 *         description: Poll not found
 */
router.post("/:id/close", requireAuth, requireCreator, closePoll);

router.use("/:id/questions", QuestionsRouter);
router.use("/:id/responses", ResponsesRouter);

export default router;
