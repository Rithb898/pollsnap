import { Request, Response } from "express";
import { ApiResponse } from "@/shared/utils/api-response";
import { ApiError } from "@/shared/errors/api-error";
import { AsyncHandler } from "@/shared/utils/async-handler";
import { AuthenticatedRequest } from "@/shared/middlewares/requireAuth";
import * as responsesService from "./responses.service";
import { submitResponseSchema } from "./responses.schema";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";

function detectDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
  const ua = userAgent.toLowerCase();
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  }
  return 'desktop';
}

function extractIpAddress(req: Request): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.socket?.remoteAddress || undefined;
}

async function lookupCountry(ip: string): Promise<string | null> {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`);
    const data = await res.json();
    return data.countryCode || null;
  } catch {
    return null;
  }
}

export const submitResponse = AsyncHandler(
  async (req: Request, res: Response) => {
    const pollId = req.params.id as string;
    
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });
    
    const userId = session?.user?.id ?? null;
    const sessionToken = req.cookies?.session_token ?? null;
    
    const userAgent = req.headers['user-agent'] || undefined;
    const deviceType = userAgent ? detectDeviceType(userAgent) : undefined;
    const ipAddress = extractIpAddress(req);
    
    let countryCode: string | undefined;
    if (ipAddress && !ipAddress.startsWith('127.') && !ipAddress.startsWith('::1')) {
      countryCode = await lookupCountry(ipAddress) || undefined;
    }

    const parseResult = submitResponseSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw ApiError.badRequest(
        "Validation failed",
        parseResult.error.issues.map(i => ({
          message: i.message,
          path: i.path
        }))
      );
    }

    const response = await responsesService.submitResponse(
      pollId,
      userId,
      sessionToken,
      parseResult.data,
      userAgent,
      deviceType,
      ipAddress,
      countryCode
    );

    if (!response) {
      throw ApiError.badRequest("Failed to create response");
    }

    return ApiResponse.created(
      res,
      "Response submitted successfully",
      response
    );
  }
);
