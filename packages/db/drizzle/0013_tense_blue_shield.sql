ALTER TABLE "bank_account" ADD COLUMN "current_balance" numeric(28, 10);--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "available_balance" numeric(28, 10);--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "limit" numeric(28, 10);--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "iso_currency_code" text;--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "unofficial_currency_code" text;--> statement-breakpoint
ALTER TABLE "bank_account" DROP COLUMN IF EXISTS "balance";