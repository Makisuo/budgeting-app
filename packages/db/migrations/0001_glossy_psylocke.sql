CREATE TYPE "public"."subscription_frequency" AS ENUM('monthly', 'yearly', 'weekly');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'expired');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"frequency" "subscription_frequency" NOT NULL,
	"status" "subscription_status" NOT NULL,
	"next_expected_payment" timestamp (3),
	"currency" text NOT NULL,
	"amount" double precision NOT NULL,
	"tenant_id" text NOT NULL,
	"created_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted_at" timestamp (3)
);
