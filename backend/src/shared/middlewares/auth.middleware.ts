import { Request, Response, NextFunction } from "express";
import { auth } from "@/lib/auth";
import { ApiError } from "@/shared/errors/api-error";

/**
 * Session type extended from Better Auth
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  session?: {
    id: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string;
    userAgent?: string;
    userId: string;
  };
}

/**
 * Verify Session Middleware
 * Extracts and validates the session from Better Auth
 * Attaches user object to req.user if session is valid
 * 
 * Usage:
 *   app.use(verifySession); // For all routes
 *   OR
 *   router.get("/protected", verifySession, controller); // For specific routes
 */
export const verifySession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get session from Better Auth using the request cookies
    const session = await auth.api.getSession({
      headers: {
        cookie: req.headers.cookie || "",
      },
    });

    if (session?.user) {
      req.user = session.user as AuthenticatedRequest["user"];
      req.session = session.session as AuthenticatedRequest["session"];
    }

    next();
  } catch (error) {
    // Session verification failed, but continue (middleware is optional)
    // User will be undefined for routes that check req.user
    next();
  }
};

/**
 * Require Auth Middleware
 * Ensures user is authenticated, returns 401 if not
 * Must be placed after verifySession in middleware chain
 * 
 * Usage:
 *   router.get("/protected", verifySession, requireAuth, controller);
 */
export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required. Please sign in.");
  }
  next();
};

export type { AuthenticatedRequest };
