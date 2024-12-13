ALTER TABLE "companies" DROP CONSTRAINT "companies_assetId_unique";--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_asset_id_unique" UNIQUE("asset_id");