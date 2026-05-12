import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/lib/auth";
import { ApiError } from "@/shared/errors/api-error";

export interface AuthenticatedRequest extends Request {
  session?: Awaited<ReturnType<typeof auth.api.getSession>>;
  user?: { id: string };
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    if (!session) {
      throw ApiError.unauthorized("Authentication required");
    }

    (req as AuthenticatedRequest).session = session;
    (req as AuthenticatedRequest).user = { id: session.user.id };

    next();
  } catch (error) {
    next(error);
  }
};
