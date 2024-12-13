CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"asset_type" text NOT NULL,
	"asset_id" text NOT NULL,
	"patterns" jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX "patterns_idx" ON "companies" USING gin ("patterns");