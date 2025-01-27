ALTER TABLE "transactions" ADD COLUMN "direct_transfer" text;--> statement-breakpoint
CREATE INDEX "idx_id" ON "accounts" USING btree ("id","tenant_id");