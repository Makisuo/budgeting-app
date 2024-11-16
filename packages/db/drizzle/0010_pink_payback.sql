ALTER TABLE "transaction" DROP CONSTRAINT "transaction_plaid_transaction_id_unique";--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "transaction" DROP COLUMN IF EXISTS "plaid_transaction_id";--> statement-breakpoint
ALTER TABLE "transaction" DROP COLUMN IF EXISTS "type";