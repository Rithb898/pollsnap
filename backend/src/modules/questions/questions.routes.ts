import { Router } from "express";
import { requireAuth } from "@/shared/middlewares/requireAuth";
import { requireCreator } from "@/shared/middlewares/requireCreator";
import {
  createQuestion,
  listQuestions,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  createOption,
  listOptions,
  updateOption,
  deleteOption,
  reorderOptions
} from "./questions.controller";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /polls/{pollId}/questions:
 *   get:
 *     summary: List questions
 *     description: Get all questions for a poll
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of questions
 *       404:
 *         description: Poll not found
 */
router.get("/", listQuestions);

/**
 * @swagger
 * /polls/{pollId}/questions:
 *   post:
 *     summary: Create question
 *     description: Create a new question for a poll (creator only, draft polls)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
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
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 maxLength: 500
 *               isMandatory:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Question created
 *       400:
 *         description: Validation failed or poll not in draft
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not creator)
 *       404:
 *         description: Poll not found
 */
router.post("/", requireAuth, requireCreator, createQuestion);

/**
 * @swagger
 * /polls/{pollId}/questions/reorder:
 *   post:
 *     summary: Reorder questions
 *     description: Reorder questions in a poll (creator only, draft polls)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
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
 *               - questionIds
 *             properties:
 *               questionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Questions reordered
 *       400:
 *         description: Invalid question IDs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not creator)
 */
router.post("/reorder", requireAuth, requireCreator, reorderQuestions);

/**
 * @swagger
 * /polls/{pollId}/questions/{questionId}:
 *   patch:
 *     summary: Update question
 *     description: Update a question (creator only, draft polls)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: questionId
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
 *               text:
 *                 type: string
 *                 maxLength: 500
 *               isMandatory:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Question updated
 *       400:
 *         description: Poll not in draft
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not creator)
 *       404:
 *         description: Question not found
 */
router.patch("/:questionId", requireAuth, requireCreator, updateQuestion);

/**
 * @swagger
 * /polls/{pollId}/questions/{questionId}:
 *   delete:
 *     summary: Delete question
 *     description: Delete a question (creator only, draft polls, no responses)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Question deleted
 *       400:
 *         description: Poll not in draft or has responses
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not creator)
 *       404:
 *         description: Question not found
 */
router.delete("/:questionId", requireAuth, requireCreator, deleteQuestion);

/**
 * @swagger
 * /polls/{pollId}/questions/{questionId}/options:
 *   get:
 *     summary: List options
 *     description: Get all options for a question
 *     tags: [Options]
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of options
 *       404:
 *         description: Question not found
 */
router.get("/:questionId/options", listOptions);

/**
 * @swagger
 * /polls/{pollId}/questions/{questionId}/options:
 *   post:
 *     summary: Create option
 *     description: Create a new option for a question (creator only, draft polls)
 *     tags: [Options]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: questionId
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
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 maxLength: 255
 *     responses:
 *       201:
 *         description: Option created
 *       400:
 *         description: Validation failed, duplicate option, or poll not in draft
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not creator)
 *       404:
 *         description: Question not found
 */
router.post("/:questionId/options", requireAuth, requireCreator, createOption);

/**
 * @swagger
 * /polls/{pollId}/questions/{questionId}/options/reorder:
 *   post:
 *     summary: Reorder options
 *     description: Reorder options in a question (creator only, draft polls)
 *     tags: [Options]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: questionId
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
 *               - optionIds
 *             properties:
 *               optionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Options reordered
 *       400:
 *         description: Invalid option IDs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not creator)
 */
router.post(
  "/:questionId/options/reorder",
  requireAuth,
  requireCreator,
  reorderOptions
);

/**
 * @swagger
 * /polls/{pollId}/questions/{questionId}/options/{optionId}:
 *   patch:
 *     summary: Update option
 *     description: Update an option (creator only, draft polls)
 *     tags: [Options]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: optionId
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
 *               text:
 *                 type: string
 *                 maxLength: 255
 *     responses:
 *       200:
 *         description: Option updated
 *       400:
 *         description: Duplicate option or poll not in draft
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not creator)
 *       404:
 *         description: Option not found
 */
router.patch(
  "/:questionId/options/:optionId",
  requireAuth,
  requireCreator,
  updateOption
);

/**
 * @swagger
 * /polls/{pollId}/questions/{questionId}/options/{optionId}:
 *   delete:
 *     summary: Delete option
 *     description: Delete an option (creator only, draft polls, no responses)
 *     tags: [Options]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: optionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Option deleted
 *       400:
 *         description: Poll not in draft or option has responses
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not creator)
 *       404:
 *         description: Option not found
 */
router.delete(
  "/:questionId/options/:optionId",
  requireAuth,
  requireCreator,
  deleteOption
);

export default router;
