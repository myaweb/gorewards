-- STEP 7 & 8 FIX: Transaction Intelligence Layer and Beta User Flow
-- Add tables for transaction normalization, card mappings, and beta feedback

-- Transaction table for storing normalized Plaid transactions
CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "linkedAccountId" TEXT NOT NULL,
    "userCardId" TEXT,
    "plaidTransactionId" TEXT NOT NULL UNIQUE,
    "merchantName" TEXT NOT NULL,
    "normalizedMerchant" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" "SpendingCategory" NOT NULL,
    "categoryConfidence" DECIMAL(3,2) NOT NULL DEFAULT 0.5,
    "plaidCategories" TEXT[],
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "correctedByUser" BOOLEAN NOT NULL DEFAULT false,
    "correctedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "Transaction_linkedAccountId_fkey" FOREIGN KEY ("linkedAccountId") REFERENCES "LinkedAccount"("id") ON DELETE CASCADE,
    CONSTRAINT "Transaction_userCardId_fkey" FOREIGN KEY ("userCardId") REFERENCES "UserCard"("id") ON DELETE SET NULL
);

-- Card Mapping table for linking Plaid accounts to user cards
CREATE TABLE IF NOT EXISTS "CardMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "linkedAccountId" TEXT NOT NULL,
    "userCardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CardMapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "CardMapping_linkedAccountId_fkey" FOREIGN KEY ("linkedAccountId") REFERENCES "LinkedAccount"("id") ON DELETE CASCADE,
    CONSTRAINT "CardMapping_userCardId_fkey" FOREIGN KEY ("userCardId") REFERENCES "UserCard"("id") ON DELETE CASCADE,
    CONSTRAINT "CardMapping_linkedAccountId_key" UNIQUE ("linkedAccountId")
);

-- Beta Feedback table
CREATE TABLE IF NOT EXISTS "BetaFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'unknown',
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BetaFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX IF NOT EXISTS "Transaction_linkedAccountId_idx" ON "Transaction"("linkedAccountId");
CREATE INDEX IF NOT EXISTS "Transaction_userCardId_idx" ON "Transaction"("userCardId");
CREATE INDEX IF NOT EXISTS "Transaction_date_idx" ON "Transaction"("date");
CREATE INDEX IF NOT EXISTS "Transaction_needsReview_idx" ON "Transaction"("needsReview");
CREATE INDEX IF NOT EXISTS "Transaction_normalizedMerchant_idx" ON "Transaction"("normalizedMerchant");

CREATE INDEX IF NOT EXISTS "CardMapping_userId_idx" ON "CardMapping"("userId");
CREATE INDEX IF NOT EXISTS "CardMapping_userCardId_idx" ON "CardMapping"("userCardId");

CREATE INDEX IF NOT EXISTS "BetaFeedback_userId_idx" ON "BetaFeedback"("userId");
CREATE INDEX IF NOT EXISTS "BetaFeedback_createdAt_idx" ON "BetaFeedback"("createdAt");
