import { Router } from "express";
import { submitResponse } from "./responses.controller";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /polls/{pollId}/responses:
 *   post:
 *     summary: Submit response
 *     description: Submit a response to a poll. For anonymous polls, uses session cookie. For non-anonymous polls, requires authentication.
 *     tags: [Responses]
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                       format: uuid
 *                     optionId:
 *                       type: string
 *                       format: uuid
 *     responses:
 *       201:
 *         description: Response submitted
 *       400:
 *         description: Validation failed, poll not active, expired, or duplicate response
 *       401:
 *         description: Authentication required for non-anonymous poll
 *       404:
 *         description: Poll not found
 */
router.post("/", submitResponse);

export default router;
