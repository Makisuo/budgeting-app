CREATE TABLE IF NOT EXISTS "transaction" (
	"id" uuid PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"plaid_transaction_id" text NOT NULL,
	"plaid_category_id" text,
	"category" text NOT NULL,
	"subcategory" text,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"amount" numeric(28, 10) NOT NULL,
	"iso_currency_code" text,
	"unoffical_currency_code" text,
	"date" date NOT NULL,
	"pending" boolean NOT NULL,
	"account_owner" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "transaction_plaid_transaction_id_unique" UNIQUE("plaid_transaction_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction" ADD CONSTRAINT "transaction_account_id_bank_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."bank_account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
