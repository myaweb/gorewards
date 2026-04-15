-- Migration: Fix Points Card Multiplier Format
-- Date: 2026-04-10
-- Description: Update multiplier values for points cards (multiply by 100)
--              Cashback cards remain unchanged (already in correct decimal format)
--
-- IMPORTANT: This migration updates multiplier values for points-based cards only.
--            Cards with CASHBACK point type are excluded from updates.

-- Step 1: Update CardMultiplier table for points cards
-- Multiply multiplierValue by 100 for all cards that have non-CASHBACK bonuses
UPDATE "CardMultiplier" 
SET "multiplierValue" = "multiplierValue" * 100
WHERE "cardId" IN (
  SELECT DISTINCT c.id 
  FROM "Card" c
  INNER JOIN "CardBonus" cb ON c.id = cb."cardId"
  WHERE cb."pointType" != 'CASHBACK'
    AND cb."isActive" = true
)
AND "multiplierValue" < 1  -- Only update if value is still in decimal format (0.01-0.99)
AND "isActive" = true;

-- Step 2: Update Card.baseRewardRate for points cards
-- Multiply baseRewardRate by 100 for all cards that have non-CASHBACK bonuses
UPDATE "Card"
SET "baseRewardRate" = "baseRewardRate" * 100
WHERE id IN (
  SELECT DISTINCT c.id 
  FROM "Card" c
  INNER JOIN "CardBonus" cb ON c.id = cb."cardId"
  WHERE cb."pointType" != 'CASHBACK'
    AND cb."isActive" = true
)
AND "baseRewardRate" < 1  -- Only update if value is still in decimal format (0.01-0.99)
AND "isActive" = true;

-- Verification queries (commented out - for manual verification only)
-- SELECT c.name, c."baseRewardRate", cb."pointType"
-- FROM "Card" c
-- LEFT JOIN "CardBonus" cb ON c.id = cb."cardId"
-- WHERE cb."isActive" = true
-- ORDER BY cb."pointType", c.name;

-- SELECT c.name, cm.category, cm."multiplierValue", cb."pointType"
-- FROM "CardMultiplier" cm
-- INNER JOIN "Card" c ON cm."cardId" = c.id
-- LEFT JOIN "CardBonus" cb ON c.id = cb."cardId"
-- WHERE cm."isActive" = true AND cb."isActive" = true
-- ORDER BY cb."pointType", c.name, cm.category;
