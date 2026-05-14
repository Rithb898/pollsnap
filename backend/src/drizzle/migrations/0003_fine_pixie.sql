ALTER TABLE "poll" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "poll" ALTER COLUMN "status" SET DEFAULT 'draft'::text;--> statement-breakpoint
DROP TYPE "public"."poll_status";--> statement-breakpoint
CREATE TYPE "public"."poll_status" AS ENUM('draft', 'active', 'closed');--> statement-breakpoint
ALTER TABLE "poll" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."poll_status";--> statement-breakpoint
ALTER TABLE "poll" ALTER COLUMN "status" SET DATA TYPE "public"."poll_status" USING "status"::"public"."poll_status";