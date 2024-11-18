CREATE TYPE "public"."requisition_status" AS ENUM('created', 'pending', 'active');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "requisition" (
	"id" text PRIMARY KEY NOT NULL,
	"institution_id" text NOT NULL,
	"status" "requisition_status" NOT NULL
);
