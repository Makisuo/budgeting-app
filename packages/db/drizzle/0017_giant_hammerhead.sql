ALTER TABLE "bank_account" RENAME COLUMN "mask" TO "iban";--> statement-breakpoint
ALTER TABLE "bank_account" DROP CONSTRAINT "bank_account_plaid_item_id_plaid_item_id_fk";
--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "requisition_id" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bank_account" ADD CONSTRAINT "bank_account_requisition_id_requisition_id_fk" FOREIGN KEY ("requisition_id") REFERENCES "public"."requisition"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "bank_account" DROP COLUMN IF EXISTS "plaid_item_id";--> statement-breakpoint
ALTER TABLE "transaction" DROP COLUMN IF EXISTS "unoffical_currency_code";