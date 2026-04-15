import { PointType } from '@prisma/client'

/**
 * Determine if a card is cashback based on multiplier value
 * Cashback cards have decimal multipliers (0.01-0.10)
 * Points cards have whole number multipliers (1-10)
 */
function isCashbackCard(multiplier: number): boolean {
  return multiplier < 1
}

/**
 * Format reward rate based on point type or multiplier value
 * @param multiplier - The multiplier value from database (decimal format: 0.05 = 5x)
 * @param pointType - The type of reward (CASHBACK, AEROPLAN, etc.) - optional
 * @returns Formatted string (e.g., "5x" or "5%")
 */
export function formatRewardRate(
  multiplier: number, 
  pointType?: PointType | string
): string {
  // Multipliers are stored as decimals in DB (0.05 = 5x, 0.015 = 1.5x)
  // Convert to display rate by multiplying by 100
  const displayRate = multiplier * 100
  
  // If pointType is explicitly provided, use it
  if (pointType === PointType.CASHBACK || pointType === 'CASHBACK') {
    // Cashback: 0.05 → "5%"
    return `${displayRate.toFixed(1)}%`
  }
  
  // If pointType is provided and not cashback, it's points
  if (pointType) {
    // Points: 0.05 → "5x"
    return `${displayRate.toFixed(1)}x`
  }
  
  // Auto-detect based on multiplier value
  // All multipliers are now < 1 (0.01 to 0.10), so we need to check pointType
  // Default to points format
  return `${displayRate.toFixed(1)}x`
}

/**
 * Format full reward text with category
 * @param multiplier - The multiplier value from database (decimal format: 0.05 = 5x)
 * @param pointType - The type of reward
 * @param category - The spending category (e.g., "groceries")
 * @returns Full text (e.g., "5x Membership Rewards on groceries")
 */
export function formatRewardText(
  multiplier: number,
  pointType: PointType | string,
  category: string
): string {
  // Convert decimal to display rate (0.05 → 5)
  const displayRate = multiplier * 100
  
  if (pointType === PointType.CASHBACK || pointType === 'CASHBACK') {
    // "5% cash back on groceries"
    return `${displayRate.toFixed(1)}% cash back on ${category}`
  } else {
    // "5x Membership Rewards points on groceries"
    const pointName = getPointTypeName(pointType as PointType)
    return `${displayRate.toFixed(1)}x ${pointName} on ${category}`
  }
}

/**
 * Get point type name for display
 * @param pointType - The type of reward
 * @returns Human-readable name (e.g., "Membership Rewards")
 */
export function getPointTypeName(pointType: PointType | string): string {
  if (pointType === PointType.CASHBACK || pointType === 'CASHBACK') {
    return 'cash back'
  }
  
  // Convert enum to readable format
  const nameMap: Record<string, string> = {
    [PointType.AEROPLAN]: 'Aeroplan points',
    [PointType.AVION]: 'Avion points',
    [PointType.MEMBERSHIP_REWARDS]: 'Membership Rewards points',
    [PointType.CASHBACK]: 'cash back',
    [PointType.SCENE_PLUS]: 'Scene+ points',
    [PointType.AIR_MILES]: 'AIR MILES',
    [PointType.AVENTURA]: 'Aventura points',
    [PointType.MARRIOTT_BONVOY]: 'Marriott Bonvoy points',
    [PointType.HILTON_HONORS]: 'Hilton Honors points',
    [PointType.AMERICAN_EXPRESS_POINTS]: 'American Express points',
    [PointType.OTHER]: 'points',
  }
  
  return nameMap[pointType] || 'points'
}
