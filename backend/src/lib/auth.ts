import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import db from "@/db/db";
import env from "@/shared/configs/env";
import { user, session, account, verification } from "@/drizzle";
import { sendResetPasswordEmail } from "@/lib/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification
    }
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      void sendResetPasswordEmail({
        to: user.email,
        name: user.name ?? undefined,
        url,
      });
    }
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    }
  }
});
