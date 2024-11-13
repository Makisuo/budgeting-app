ALTER TABLE "bank_account" DROP CONSTRAINT "bank_account_id_unique";--> statement-breakpoint
ALTER TABLE "bank_account" ADD PRIMARY KEY ("id");