CREATE TYPE "public"."account_type" AS ENUM('depository', 'credit', 'other_asset', 'loan', 'other_liability');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('posted', 'pending');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"currency" text NOT NULL,
	"type" "account_type" NOT NULL,
	"institution_id" text NOT NULL,
	"balance_amount" double precision NOT NULL,
	"balance_currency" text NOT NULL,
	"tenant_id" text NOT NULL,
	"created_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "institutions" (
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
CREATE TABLE IF NOT EXISTS "requisitions" (
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
CREATE TABLE IF NOT EXISTS "transactions" (
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
	"tenant_id" text NOT NULL,
	"created_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted_at" timestamp (3)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_index" ON "institutions" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_country_index" ON "institutions" USING btree ("name","countries");