import { Resend } from "resend";
import env from "@/shared/configs/env";
import { logger } from "@/shared/utils/logger";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendResetPasswordEmail(params: {
  to: string;
  name?: string;
  url: string;
}) {
  const { to, name, url } = params;

  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: [to],
    subject: "Reset your PollSnap password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>Hi ${name || "there"},</p>
        <p>We got a request to reset your PollSnap password.</p>
        <p>
          <a href="${url}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#111827;color:#ffffff;text-decoration:none;">
            Reset password
          </a>
        </p>
        <p>If you did not request this, you can ignore this email.</p>
        <p>This link expires soon for safety.</p>
      </div>
    `,
  });

  if (error) {
    logger.error({ error, to }, "[email]: reset password send failed");
  }
}
