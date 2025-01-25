ALTER TABLE "accounts" ALTER COLUMN "iban" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "iban" DROP NOT NULL;