ALTER TABLE "response" DROP CONSTRAINT "response_poll_respondent_unique";--> statement-breakpoint
ALTER TABLE "response" DROP CONSTRAINT "response_poll_session_unique";--> statement-breakpoint
ALTER TABLE "response" ADD CONSTRAINT "response_poll_respondent_unique" UNIQUE("poll_id","respondent_id");--> statement-breakpoint
ALTER TABLE "response" ADD CONSTRAINT "response_poll_session_unique" UNIQUE("poll_id","session_token");