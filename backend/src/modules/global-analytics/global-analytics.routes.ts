import { Router } from "express";
import { requireAuth } from "@/shared/middlewares/requireAuth";
import {
  getTrends,
  getDeviceBreakdown,
  getBrowserBreakdown,
  getOsBreakdown,
  getLeaderboard,
  getHeatmap,
  getAudienceData,
  getGeographicDistribution,
} from "./global-analytics.controller";

const router = Router();

/**
 * @swagger
 * /analytics/trends:
 *   get:
 *     summary: Get global response trends
 *     description: Get response count trends across all user's polls for a given time period
 *     tags: [Global Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to include in the trend data
 *     responses:
 *       200:
 *         description: Trend data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                   responses:
 *                     type: integer
 *                   completionRate:
 *                     type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/trends", requireAuth, getTrends);

/**
 * @swagger
 * /analytics/device:
 *   get:
 *     summary: Get device breakdown
 *     description: Get percentage breakdown of responses by device type (mobile/desktop/tablet)
 *     tags: [Global Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Device breakdown data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mobile:
 *                   type: integer
 *                 desktop:
 *                   type: integer
 *                 tablet:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/device", requireAuth, getDeviceBreakdown);

/**
 * @swagger
 * /analytics/browser:
 *   get:
 *     summary: Get browser breakdown
 *     description: Get percentage breakdown of responses by browser
 *     tags: [Global Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Browser breakdown data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   value:
 *                     type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/browser", requireAuth, getBrowserBreakdown);

/**
 * @swagger
 * /analytics/os:
 *   get:
 *     summary: Get OS breakdown
 *     description: Get percentage breakdown of responses by operating system
 *     tags: [Global Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OS breakdown data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   value:
 *                     type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/os", requireAuth, getOsBreakdown);

/**
 * @swagger
 * /analytics/geographic:
 *   get:
 *     summary: Get geographic distribution
 *     description: Get top 5 countries by response count
 *     tags: [Global Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Geographic distribution data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                   code:
 *                     type: string
 *                   users:
 *                     type: integer
 *                   percentage:
 *                     type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/geographic", requireAuth, getGeographicDistribution);

/**
 * @swagger
 * /analytics/leaderboard:
 *   get:
 *     summary: Get top performing polls leaderboard
 *     description: Get top 5 polls ranked by response count
 *     tags: [Global Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leaderboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   responses:
 *                     type: integer
 *                   rate:
 *                     type: integer
 *                   trend:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/leaderboard", requireAuth, getLeaderboard);

/**
 * @swagger
 * /analytics/heatmap:
 *   get:
 *     summary: Get activity heatmap
 *     description: Get response distribution by day and time of day
 *     tags: [Global Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Heatmap data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   day:
 *                     type: string
 *                   hours:
 *                     type: array
 *                     items:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/heatmap", requireAuth, getHeatmap);

/**
 * @swagger
 * /analytics/audience:
 *   get:
 *     summary: Get all audience data
 *     description: Get combined device, browser, OS, and geographic breakdowns in one request
 *     tags: [Global Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Combined audience data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 device:
 *                   type: object
 *                   properties:
 *                     mobile:
 *                       type: integer
 *                     desktop:
 *                       type: integer
 *                     tablet:
 *                       type: integer
 *                 browser:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       value:
 *                         type: integer
 *                 os:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       value:
 *                         type: integer
 *                 geographic:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       country:
 *                         type: string
 *                       code:
 *                         type: string
 *                       users:
 *                         type: integer
 *                       percentage:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/audience", requireAuth, getAudienceData);

export default router;
