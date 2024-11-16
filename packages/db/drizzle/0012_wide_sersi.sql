ALTER TABLE "transaction" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "authorized_at" timestamp;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "posted_at" timestamp;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "location" jsonb;