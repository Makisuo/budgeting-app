ALTER TABLE "bank_account" DROP CONSTRAINT "bank_account_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "bank_account" DROP COLUMN IF EXISTS "user_id";