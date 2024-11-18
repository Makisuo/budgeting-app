ALTER TABLE "requisition" ADD COLUMN "reference_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_reference_id_unique" UNIQUE("reference_id");