CREATE INDEX "idx_transactions_tenant_currency_amount" ON "transactions" USING btree ("tenant_id","currency","amount");--> statement-breakpoint
CREATE INDEX "idx_accounts_tenant_currency_amount" ON "transactions" USING btree ("account_id","tenant_id","currency");--> statement-breakpoint
CREATE INDEX "idx_date" ON "transactions" USING btree ("date");