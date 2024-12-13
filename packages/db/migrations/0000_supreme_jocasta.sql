CREATE TYPE "public"."account_type" AS ENUM('depository', 'credit', 'other_asset', 'loan', 'other_liability');--> statement-breakpoint
CREATE TYPE "public"."subscription_frequency" AS ENUM('monthly', 'yearly', 'weekly');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('posted', 'pending');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"currency" text NOT NULL,
	"type" "account_type" NOT NULL,
	"institution_id" text NOT NULL,
	"balance_amount" double precision NOT NULL,
	"balance_currency" text NOT NULL,
	"tenant_id" text NOT NULL,
	"last_sync" timestamp (3),
	"created_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"asset_type" text NOT NULL,
	"asset_id" text NOT NULL,
	"patterns" jsonb NOT NULL,
	CONSTRAINT "companies_assetId_unique" UNIQUE("asset_id")
);
--> statement-breakpoint
CREATE TABLE "institutions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"logo" text,
	"provider" text NOT NULL,
	"countries" jsonb NOT NULL,
	"transaction_total_days" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "requisitions" (
	"id" text PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"reference_id" text NOT NULL,
	"institution_id" text NOT NULL,
	"tenant_id" text NOT NULL,
	"created_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
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
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"amount" double precision NOT NULL,
	"currency" text NOT NULL,
	"date" timestamp (3) NOT NULL,
	"status" "transaction_status" NOT NULL,
	"balance" double precision,
	"category" text,
	"method" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"currency_rate" double precision,
	"currency_source" text,
	"account_id" text NOT NULL,
	"company_id" integer,
	"tenant_id" text NOT NULL,
	"created_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted_at" timestamp (3)
);
--> statement-breakpoint
CREATE INDEX "patterns_idx" ON "companies" USING gin ("patterns");--> statement-breakpoint
CREATE INDEX "name_index" ON "institutions" USING btree ("name");--> statement-breakpoint
CREATE INDEX "name_country_index" ON "institutions" USING btree ("name","countries");