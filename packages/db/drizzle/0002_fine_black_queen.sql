ALTER TABLE "plaid_item" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "plaid_item" RENAME COLUMN "accessToken" TO "access_token";--> statement-breakpoint
ALTER TABLE "plaid_item" DROP CONSTRAINT "plaid_item_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "plaid_item" ADD COLUMN "institution_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaid_item" ADD CONSTRAINT "plaid_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
