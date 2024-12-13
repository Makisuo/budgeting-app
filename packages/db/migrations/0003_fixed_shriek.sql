ALTER TABLE "transactions" ALTER COLUMN "category_id" SET DEFAULT 'uncategorized';--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "category_id" SET NOT NULL;