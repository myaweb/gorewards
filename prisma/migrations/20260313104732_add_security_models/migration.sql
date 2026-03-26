-- CreateEnum
CREATE TYPE "CardNetwork" AS ENUM ('VISA', 'MASTERCARD', 'AMEX', 'DISCOVER');

-- CreateEnum
CREATE TYPE "SpendingCategory" AS ENUM ('GROCERY', 'GAS', 'DINING', 'TRAVEL', 'RECURRING', 'ENTERTAINMENT', 'SHOPPING', 'UTILITIES', 'OTHER');

-- CreateEnum
CREATE TYPE "PointType" AS ENUM ('AEROPLAN', 'AVION', 'MEMBERSHIP_REWARDS', 'CASHBACK', 'SCENE_PLUS', 'AIR_MILES', 'AVENTURA', 'MARRIOTT_BONVOY', 'HILTON_HONORS', 'AMERICAN_EXPRESS_POINTS', 'OTHER');

-- CreateEnum
CREATE TYPE "CreditScoreRange" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "PreferredRewardType" AS ENUM ('TRAVEL_POINTS', 'CASHBACK', 'HOTEL_POINTS', 'AIRLINE_MILES', 'FLEXIBLE_POINTS', 'NO_PREFERENCE');

-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AuditCategory" AS ENUM ('AUTHENTICATION', 'AUTHORIZATION', 'DATA_ACCESS', 'DATA_MODIFICATION', 'SYSTEM_CONFIGURATION', 'FINANCIAL_CALCULATION', 'TOKEN_MANAGEMENT');

-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM ('UNAUTHORIZED_ACCESS', 'RATE_LIMIT_EXCEEDED', 'INVALID_TOKEN', 'SUSPICIOUS_ACTIVITY', 'INPUT_VALIDATION_FAILURE', 'WEBHOOK_VERIFICATION_FAILURE', 'ADMIN_ACCESS_VIOLATION');

-- CreateEnum
CREATE TYPE "SecuritySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SecurityEventStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE');

-- CreateEnum
CREATE TYPE "PerformanceMetricType" AS ENUM ('RESPONSE_TIME', 'DATABASE_QUERY_TIME', 'MEMORY_USAGE', 'CPU_USAGE', 'ERROR_RATE', 'THROUGHPUT', 'CACHE_HIT_RATE');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('PLAID_ACCESS_TOKEN', 'PLAID_REFRESH_TOKEN', 'STRIPE_CONNECT_TOKEN', 'EXTERNAL_API_TOKEN');

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "network" "CardNetwork" NOT NULL,
    "annualFee" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "baseRewardRate" DECIMAL(5,4) NOT NULL DEFAULT 0.01,
    "imageUrl" TEXT,
    "affiliateLink" TEXT,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "features" JSONB,
    "eligibility" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardBonus" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "bonusPoints" INTEGER NOT NULL,
    "pointType" "PointType" NOT NULL,
    "minimumSpendAmount" DECIMAL(10,2) NOT NULL,
    "spendPeriodMonths" INTEGER NOT NULL,
    "description" TEXT,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "conditions" JSONB,
    "estimatedValue" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardBonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardMultiplier" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "category" "SpendingCategory" NOT NULL,
    "multiplierValue" DECIMAL(5,2) NOT NULL,
    "description" TEXT,
    "monthlyLimit" DECIMAL(10,2),
    "annualLimit" DECIMAL(10,2),
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardMultiplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "requiredPoints" INTEGER NOT NULL,
    "pointType" "PointType" NOT NULL,
    "description" TEXT,
    "estimatedValue" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creditScoreRange" "CreditScoreRange",
    "annualIncome" DECIMAL(12,2),
    "preferredRewardType" "PreferredRewardType" NOT NULL DEFAULT 'NO_PREFERENCE',
    "monthlyGrocery" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "monthlyGas" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "monthlyDining" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "monthlyBills" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "monthlyTravel" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "monthlyShopping" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "monthlyOther" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "travelGoals" JSONB,
    "maxAnnualFee" DECIMAL(8,2),
    "prioritizeSignupBonus" BOOLEAN NOT NULL DEFAULT true,
    "timeHorizon" TEXT NOT NULL DEFAULT 'LONG_TERM',
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "openDate" TIMESTAMP(3) NOT NULL,
    "annualFeeDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "downgradeEligibleDate" TIMESTAMP(3),
    "downgradeToCardId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonusProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userCardId" TEXT NOT NULL,
    "cardBonusId" TEXT NOT NULL,
    "requiredSpend" DECIMAL(10,2) NOT NULL,
    "currentSpend" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "bonusDeadline" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedDate" TIMESTAMP(3),
    "bonusAwarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BonusProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plaidItemId" TEXT NOT NULL,
    "plaidAccessToken" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedStrategy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalName" TEXT NOT NULL,
    "roadmapData" JSONB NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardComparison" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cardAId" TEXT NOT NULL,
    "cardBId" TEXT NOT NULL,
    "aiVerdictText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardOffer" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "offerType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bonusPoints" INTEGER,
    "pointType" "PointType",
    "cashValue" DECIMAL(10,2),
    "minimumSpend" DECIMAL(10,2),
    "timeframe" INTEGER,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "terms" TEXT,
    "eligibility" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardHistory" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "changeType" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changeReason" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "CardHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledJob" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cronExpression" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "parameters" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRun" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "lastError" TEXT,
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "ScheduledJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpdateBatch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "batchType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalUpdates" INTEGER NOT NULL DEFAULT 0,
    "successfulUpdates" INTEGER NOT NULL DEFAULT 0,
    "failedUpdates" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "UpdateBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpdateRecord" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "updateType" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB NOT NULL,
    "changeReason" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpdateRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "correlationId" TEXT NOT NULL,
    "sessionId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" "AuditSeverity" NOT NULL DEFAULT 'INFO',
    "category" "AuditCategory" NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL,
    "type" "SecurityEventType" NOT NULL,
    "severity" "SecuritySeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "endpoint" TEXT,
    "userId" TEXT,
    "detectionRule" TEXT,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "status" "SecurityEventStatus" NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "metadata" JSONB,
    "correlationId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceMetric" (
    "id" TEXT NOT NULL,
    "metricType" "PerformanceMetricType" NOT NULL,
    "endpoint" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeWindow" INTEGER NOT NULL,
    "userId" TEXT,
    "requestId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "PerformanceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncryptedToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenType" "TokenType" NOT NULL,
    "encryptedValue" TEXT NOT NULL,
    "keyVersion" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3),
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsed" TIMESTAMP(3),

    CONSTRAINT "EncryptedToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_name_key" ON "Card"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Card_slug_key" ON "Card"("slug");

-- CreateIndex
CREATE INDEX "Card_bank_idx" ON "Card"("bank");

-- CreateIndex
CREATE INDEX "Card_network_idx" ON "Card"("network");

-- CreateIndex
CREATE INDEX "Card_isActive_idx" ON "Card"("isActive");

-- CreateIndex
CREATE INDEX "Card_slug_idx" ON "Card"("slug");

-- CreateIndex
CREATE INDEX "CardBonus_cardId_idx" ON "CardBonus"("cardId");

-- CreateIndex
CREATE INDEX "CardBonus_pointType_idx" ON "CardBonus"("pointType");

-- CreateIndex
CREATE INDEX "CardBonus_validFrom_validUntil_idx" ON "CardBonus"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "CardBonus_isActive_idx" ON "CardBonus"("isActive");

-- CreateIndex
CREATE INDEX "CardMultiplier_cardId_idx" ON "CardMultiplier"("cardId");

-- CreateIndex
CREATE INDEX "CardMultiplier_category_idx" ON "CardMultiplier"("category");

-- CreateIndex
CREATE INDEX "CardMultiplier_validFrom_validUntil_idx" ON "CardMultiplier"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "CardMultiplier_isActive_idx" ON "CardMultiplier"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CardMultiplier_cardId_category_validFrom_key" ON "CardMultiplier"("cardId", "category", "validFrom");

-- CreateIndex
CREATE UNIQUE INDEX "Goal_name_key" ON "Goal"("name");

-- CreateIndex
CREATE INDEX "Goal_pointType_idx" ON "Goal"("pointType");

-- CreateIndex
CREATE INDEX "Goal_isActive_idx" ON "Goal"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "User_clerkUserId_idx" ON "User"("clerkUserId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_userId_idx" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_creditScoreRange_idx" ON "UserProfile"("creditScoreRange");

-- CreateIndex
CREATE INDEX "UserProfile_preferredRewardType_idx" ON "UserProfile"("preferredRewardType");

-- CreateIndex
CREATE INDEX "UserProfile_isComplete_idx" ON "UserProfile"("isComplete");

-- CreateIndex
CREATE INDEX "UserCard_userId_idx" ON "UserCard"("userId");

-- CreateIndex
CREATE INDEX "UserCard_cardId_idx" ON "UserCard"("cardId");

-- CreateIndex
CREATE INDEX "UserCard_openDate_idx" ON "UserCard"("openDate");

-- CreateIndex
CREATE INDEX "UserCard_annualFeeDate_idx" ON "UserCard"("annualFeeDate");

-- CreateIndex
CREATE INDEX "UserCard_isActive_idx" ON "UserCard"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "UserCard_userId_cardId_key" ON "UserCard"("userId", "cardId");

-- CreateIndex
CREATE INDEX "BonusProgress_userId_idx" ON "BonusProgress"("userId");

-- CreateIndex
CREATE INDEX "BonusProgress_userCardId_idx" ON "BonusProgress"("userCardId");

-- CreateIndex
CREATE INDEX "BonusProgress_bonusDeadline_idx" ON "BonusProgress"("bonusDeadline");

-- CreateIndex
CREATE INDEX "BonusProgress_isCompleted_idx" ON "BonusProgress"("isCompleted");

-- CreateIndex
CREATE INDEX "BonusProgress_bonusAwarded_idx" ON "BonusProgress"("bonusAwarded");

-- CreateIndex
CREATE UNIQUE INDEX "BonusProgress_userId_userCardId_cardBonusId_key" ON "BonusProgress"("userId", "userCardId", "cardBonusId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedAccount_plaidItemId_key" ON "LinkedAccount"("plaidItemId");

-- CreateIndex
CREATE INDEX "LinkedAccount_userId_idx" ON "LinkedAccount"("userId");

-- CreateIndex
CREATE INDEX "LinkedAccount_plaidItemId_idx" ON "LinkedAccount"("plaidItemId");

-- CreateIndex
CREATE INDEX "SavedStrategy_userId_idx" ON "SavedStrategy"("userId");

-- CreateIndex
CREATE INDEX "SavedStrategy_isCompleted_idx" ON "SavedStrategy"("isCompleted");

-- CreateIndex
CREATE INDEX "SavedStrategy_createdAt_idx" ON "SavedStrategy"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CardComparison_slug_key" ON "CardComparison"("slug");

-- CreateIndex
CREATE INDEX "CardComparison_slug_idx" ON "CardComparison"("slug");

-- CreateIndex
CREATE INDEX "CardComparison_cardAId_idx" ON "CardComparison"("cardAId");

-- CreateIndex
CREATE INDEX "CardComparison_cardBId_idx" ON "CardComparison"("cardBId");

-- CreateIndex
CREATE INDEX "CardOffer_cardId_idx" ON "CardOffer"("cardId");

-- CreateIndex
CREATE INDEX "CardOffer_offerType_idx" ON "CardOffer"("offerType");

-- CreateIndex
CREATE INDEX "CardOffer_validFrom_validUntil_idx" ON "CardOffer"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "CardOffer_isActive_idx" ON "CardOffer"("isActive");

-- CreateIndex
CREATE INDEX "CardHistory_cardId_idx" ON "CardHistory"("cardId");

-- CreateIndex
CREATE INDEX "CardHistory_changeType_idx" ON "CardHistory"("changeType");

-- CreateIndex
CREATE INDEX "CardHistory_effectiveDate_idx" ON "CardHistory"("effectiveDate");

-- CreateIndex
CREATE INDEX "CardHistory_createdAt_idx" ON "CardHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledJob_name_key" ON "ScheduledJob"("name");

-- CreateIndex
CREATE INDEX "ScheduledJob_isActive_idx" ON "ScheduledJob"("isActive");

-- CreateIndex
CREATE INDEX "ScheduledJob_nextRun_idx" ON "ScheduledJob"("nextRun");

-- CreateIndex
CREATE INDEX "ScheduledJob_status_idx" ON "ScheduledJob"("status");

-- CreateIndex
CREATE INDEX "ScheduledJob_jobType_idx" ON "ScheduledJob"("jobType");

-- CreateIndex
CREATE INDEX "UpdateBatch_status_idx" ON "UpdateBatch"("status");

-- CreateIndex
CREATE INDEX "UpdateBatch_createdAt_idx" ON "UpdateBatch"("createdAt");

-- CreateIndex
CREATE INDEX "UpdateBatch_createdBy_idx" ON "UpdateBatch"("createdBy");

-- CreateIndex
CREATE INDEX "UpdateRecord_batchId_idx" ON "UpdateRecord"("batchId");

-- CreateIndex
CREATE INDEX "UpdateRecord_cardId_idx" ON "UpdateRecord"("cardId");

-- CreateIndex
CREATE INDEX "UpdateRecord_status_idx" ON "UpdateRecord"("status");

-- CreateIndex
CREATE INDEX "UpdateRecord_updateType_idx" ON "UpdateRecord"("updateType");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_correlationId_idx" ON "AuditLog"("correlationId");

-- CreateIndex
CREATE INDEX "AuditLog_severity_idx" ON "AuditLog"("severity");

-- CreateIndex
CREATE INDEX "AuditLog_category_idx" ON "AuditLog"("category");

-- CreateIndex
CREATE INDEX "SecurityEvent_type_idx" ON "SecurityEvent"("type");

-- CreateIndex
CREATE INDEX "SecurityEvent_severity_idx" ON "SecurityEvent"("severity");

-- CreateIndex
CREATE INDEX "SecurityEvent_status_idx" ON "SecurityEvent"("status");

-- CreateIndex
CREATE INDEX "SecurityEvent_timestamp_idx" ON "SecurityEvent"("timestamp");

-- CreateIndex
CREATE INDEX "SecurityEvent_userId_idx" ON "SecurityEvent"("userId");

-- CreateIndex
CREATE INDEX "SecurityEvent_correlationId_idx" ON "SecurityEvent"("correlationId");

-- CreateIndex
CREATE INDEX "PerformanceMetric_metricType_idx" ON "PerformanceMetric"("metricType");

-- CreateIndex
CREATE INDEX "PerformanceMetric_endpoint_idx" ON "PerformanceMetric"("endpoint");

-- CreateIndex
CREATE INDEX "PerformanceMetric_timestamp_idx" ON "PerformanceMetric"("timestamp");

-- CreateIndex
CREATE INDEX "PerformanceMetric_userId_idx" ON "PerformanceMetric"("userId");

-- CreateIndex
CREATE INDEX "EncryptedToken_userId_idx" ON "EncryptedToken"("userId");

-- CreateIndex
CREATE INDEX "EncryptedToken_tokenType_idx" ON "EncryptedToken"("tokenType");

-- CreateIndex
CREATE INDEX "EncryptedToken_expiresAt_idx" ON "EncryptedToken"("expiresAt");

-- CreateIndex
CREATE INDEX "EncryptedToken_lastUsed_idx" ON "EncryptedToken"("lastUsed");

-- CreateIndex
CREATE UNIQUE INDEX "EncryptedToken_userId_tokenType_key" ON "EncryptedToken"("userId", "tokenType");

-- AddForeignKey
ALTER TABLE "CardBonus" ADD CONSTRAINT "CardBonus_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardMultiplier" ADD CONSTRAINT "CardMultiplier_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusProgress" ADD CONSTRAINT "BonusProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusProgress" ADD CONSTRAINT "BonusProgress_userCardId_fkey" FOREIGN KEY ("userCardId") REFERENCES "UserCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusProgress" ADD CONSTRAINT "BonusProgress_cardBonusId_fkey" FOREIGN KEY ("cardBonusId") REFERENCES "CardBonus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedAccount" ADD CONSTRAINT "LinkedAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedStrategy" ADD CONSTRAINT "SavedStrategy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardOffer" ADD CONSTRAINT "CardOffer_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardHistory" ADD CONSTRAINT "CardHistory_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateRecord" ADD CONSTRAINT "UpdateRecord_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "UpdateBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateRecord" ADD CONSTRAINT "UpdateRecord_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
