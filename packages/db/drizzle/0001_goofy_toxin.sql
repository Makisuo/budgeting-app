ALTER TABLE "bank_account" RENAME COLUMN "officialName" TO "official_name";--> statement-breakpoint
ALTER TABLE "bank_account" RENAME COLUMN "plaidItemId" TO "plaid_item_id";--> statement-breakpoint
ALTER TABLE "bank_account" DROP CONSTRAINT "bank_account_plaidItemId_plaid_item_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bank_account" ADD CONSTRAINT "bank_account_plaid_item_id_plaid_item_id_fk" FOREIGN KEY ("plaid_item_id") REFERENCES "public"."plaid_item"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
