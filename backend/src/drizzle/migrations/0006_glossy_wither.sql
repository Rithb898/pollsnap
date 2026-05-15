ALTER TABLE "response" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "response" ADD COLUMN "country_code" text;--> statement-breakpoint
CREATE INDEX "response_country_idx" ON "response" USING btree ("country_code");