ALTER TABLE "transactions" ALTER COLUMN "company_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "company_id" SET NOT NULL;