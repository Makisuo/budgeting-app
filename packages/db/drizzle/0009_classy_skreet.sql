ALTER TABLE "transaction" DROP COLUMN IF EXISTS "plaid_category_id";--> statement-breakpoint
ALTER TABLE "transaction" DROP COLUMN IF EXISTS "category";--> statement-breakpoint
ALTER TABLE "transaction" DROP COLUMN IF EXISTS "subcategory";