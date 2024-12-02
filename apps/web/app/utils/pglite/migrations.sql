-- CreateEnum
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transactionStatus') THEN
        CREATE TYPE "transactionStatus" AS ENUM ('posted', 'pending');
    END IF;
END $$;

-- CreateEnum
-- CreateEnum
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'accountType') THEN
        CREATE TYPE "accountType" AS ENUM ('depository', 'credit', 'other_asset', 'loan', 'other_liability');
    END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "institutions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "provider" TEXT NOT NULL,
    "countries" JSONB NOT NULL,
    "transaction_total_days" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS  "accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "type" "accountType" NOT NULL,
    "institution_id" TEXT NOT NULL,
    "balance_amount" DOUBLE PRECISION NOT NULL,
    "balance_currency" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "transactions" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "transactionStatus" NOT NULL,
    "balance" DOUBLE PRECISION,
    "category" TEXT,
    "method" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "currency_rate" DOUBLE PRECISION,
    "currency_source" TEXT,
    "account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "requisitions" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "requisitions_pkey" PRIMARY KEY ("id")
);




