import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@/lib/auth";

const router = Router();

/**
 * @swagger
 * /auth/sign-in/credentials:
 *   post:
 *     summary: Sign in with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required: [email, password]
 *     responses:
 *       200:
 *         description: Sign in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Invalid credentials
 *
 * /auth/sign-up/credentials:
 *   post:
 *     summary: Sign up with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *             required: [email, password, name]
 *     responses:
 *       200:
 *         description: Sign up successful
 *       400:
 *         description: Invalid input or email already exists
 *
 * /auth/sign-out:
 *   post:
 *     summary: Sign out and destroy session
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Sign out successful
 *
 * /auth/sign-in/google:
 *   get:
 *     summary: Redirect to Google OAuth
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Google login
 *
 * /auth/sign-in/github:
 *   get:
 *     summary: Redirect to GitHub OAuth
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to GitHub login
 */
router.use(toNodeHandler(auth));

export default router;
