CREATE TABLE IF NOT EXISTS "institution" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"bic" text NOT NULL,
	"transaction_total_days" integer NOT NULL,
	"countries" text[] DEFAULT '{}' NOT NULL,
	"logo" text NOT NULL,
	"max_access_valid_for_days" integer NOT NULL
);
