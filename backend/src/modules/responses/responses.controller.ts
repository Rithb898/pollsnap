import { Request, Response } from "express";
import { ApiResponse } from "@/shared/utils/api-response";
import { ApiError } from "@/shared/errors/api-error";
import { AsyncHandler } from "@/shared/utils/async-handler";
import { AuthenticatedRequest } from "@/shared/middlewares/requireAuth";
import * as responsesService from "./responses.service";
import { submitResponseSchema } from "./responses.schema";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";

function detectDeviceType(userAgent: string): "mobile" | "desktop" | "tablet" {
  const ua = userAgent.toLowerCase();
  if (ua.includes("tablet") || ua.includes("ipad")) {
    return "tablet";
  }
  if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone")
  ) {
    return "mobile";
  }
  return "desktop";
}

function normalizeCountryCode(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const code = value.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code) || code === "XX") {
    return null;
  }

  return code;
}

function isPrivateOrLocalIp(ip: string): boolean {
  const normalized = ip.trim().toLowerCase();

  if (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized.startsWith("127.") ||
    normalized.startsWith("10.") ||
    normalized.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized) ||
    normalized.startsWith("169.254.") ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd")
  ) {
    return true;
  }

  return false;
}

function extractIpAddress(req: Request): string | undefined {
  const directHeaders = [
    req.headers["cf-connecting-ip"],
    req.headers["x-real-ip"],
    req.headers["x-client-ip"]
  ];

  for (const header of directHeaders) {
    if (typeof header === "string" && header.trim()) {
      return header.trim();
    }
  }

  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() || undefined;
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0]?.trim() || undefined;
  }

  return req.ip || req.socket?.remoteAddress || undefined;
}

function extractCountryFromHeaders(req: Request): string | null {
  return (
    normalizeCountryCode(req.headers["cf-ipcountry"]) ||
    normalizeCountryCode(req.headers["x-vercel-ip-country"]) ||
    normalizeCountryCode(req.headers["cloudfront-viewer-country"]) ||
    normalizeCountryCode(req.headers["x-country-code"])
  );
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

    const userAgent = req.headers["user-agent"] || undefined;
    const deviceType = userAgent ? detectDeviceType(userAgent) : undefined;
    const ipAddress = extractIpAddress(req);

    const countryFromHeader = extractCountryFromHeaders(req);
    let countryCode: string | undefined = countryFromHeader || undefined;

    if (!countryCode && ipAddress && !isPrivateOrLocalIp(ipAddress)) {
      countryCode = (await lookupCountry(ipAddress)) || undefined;
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
