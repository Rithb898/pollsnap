CREATE TYPE "public"."poll_status" AS ENUM('draft', 'active', 'closed', 'published');--> statement-breakpoint
CREATE TABLE "option" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"text" text NOT NULL,
	"order_index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"response_goal" integer,
	"status" "poll_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "question" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"text" text NOT NULL,
	"is_mandatory" boolean DEFAULT true NOT NULL,
	"order_index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "response" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"respondent_id" text,
	"session_token" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "response_poll_respondent_unique" UNIQUE NULLS NOT DISTINCT("poll_id","respondent_id"),
	CONSTRAINT "response_poll_session_unique" UNIQUE NULLS NOT DISTINCT("poll_id","session_token")
);
--> statement-breakpoint
CREATE TABLE "response_answer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"response_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"option_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "option" ADD CONSTRAINT "option_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll" ADD CONSTRAINT "poll_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_poll_id_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."poll"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response" ADD CONSTRAINT "response_poll_id_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."poll"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response" ADD CONSTRAINT "response_respondent_id_user_id_fk" FOREIGN KEY ("respondent_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_answer" ADD CONSTRAINT "response_answer_response_id_response_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."response"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_answer" ADD CONSTRAINT "response_answer_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_answer" ADD CONSTRAINT "response_answer_option_id_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."option"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "option_question_id_idx" ON "option" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "poll_creator_id_idx" ON "poll" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "poll_status_idx" ON "poll" USING btree ("status");--> statement-breakpoint
CREATE INDEX "question_poll_id_idx" ON "question" USING btree ("poll_id");--> statement-breakpoint
CREATE INDEX "response_poll_id_idx" ON "response" USING btree ("poll_id");--> statement-breakpoint
CREATE INDEX "response_answer_response_id_idx" ON "response_answer" USING btree ("response_id");