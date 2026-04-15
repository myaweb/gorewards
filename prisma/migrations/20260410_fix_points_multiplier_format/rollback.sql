-- Rollback Migration: Fix Points Card Multiplier Format
-- Date: 2026-04-10
-- Description: Revert multiplier values for points cards (divide by 100)
--
-- WARNING: Only run this if you need to rollback the migration!
--          This will revert points cards back to decimal format (0.01-0.99)

-- Step 1: Rollback CardMultiplier table for points cards
-- Divide multiplierValue by 100 for all cards that have non-CASHBACK bonuses
UPDATE "CardMultiplier" 
SET "multiplierValue" = "multiplierValue" / 100
WHERE "cardId" IN (
  SELECT DISTINCT c.id 
  FROM "Card" c
  INNER JOIN "CardBonus" cb ON c.id = cb."cardId"
  WHERE cb."pointType" != 'CASHBACK'
    AND cb."isActive" = true
)
AND "multiplierValue" >= 1  -- Only rollback if value is in whole number format (1+)
AND "isActive" = true;

-- Step 2: Rollback Card.baseRewardRate for points cards
-- Divide baseRewardRate by 100 for all cards that have non-CASHBACK bonuses
UPDATE "Card"
SET "baseRewardRate" = "baseRewardRate" / 100
WHERE id IN (
  SELECT DISTINCT c.id 
  FROM "Card" c
  INNER JOIN "CardBonus" cb ON c.id = cb."cardId"
  WHERE cb."pointType" != 'CASHBACK'
    AND cb."isActive" = true
)
AND "baseRewardRate" >= 1  -- Only rollback if value is in whole number format (1+)
AND "isActive" = true;

-- Verification: Check if rollback was successful
-- SELECT c.name, c."baseRewardRate", cb."pointType"
-- FROM "Card" c
-- LEFT JOIN "CardBonus" cb ON c.id = cb."cardId"
-- WHERE cb."isActive" = true
-- ORDER BY cb."pointType", c.name;
