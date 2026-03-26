import { 
  CardSchema, 
  CreateCardSchema,
  CardBonusSchema,
  CreateCardBonusSchema,
  CardMultiplierSchema,
  CreateCardMultiplierSchema,
  GoalSchema,
  CreateGoalSchema
} from '../validations/card'

describe('Card Validation Schemas', () => {
  describe('CardSchema', () => {
    const validCard = {
      id: 'clp123456789',
      name: 'TD Aeroplan Visa Infinite',
      bank: 'TD',
      network: 'VISA' as const,
      annualFee: 139,
      currency: 'CAD',
      baseImageUrl: 'https://example.com/card.jpg',
      isActive: true
    }

    it('should validate a complete valid card', () => {
      const result = CardSchema.safeParse(validCard)
      expect(result.success).toBe(true)
    })

    it('should validate card without optional fields', () => {
      const minimalCard = {
        name: 'Basic Card',
        bank: 'RBC',
        network: 'MASTERCARD' as const,
        annualFee: 0
      }

      const result = CardSchema.safeParse(minimalCard)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.currency).toBe('CAD') // Default value
        expect(result.data.isActive).toBe(true)  // Default value
      }
    })

    it('should reject card with empty name', () => {
      const invalidCard = { ...validCard, name: '' }
      const result = CardSchema.safeParse(invalidCard)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Card name is required')
      }
    })

    it('should reject card with negative annual fee', () => {
      const invalidCard = { ...validCard, annualFee: -50 }
      const result = CardSchema.safeParse(invalidCard)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Annual fee must be non-negative')
      }
    })

    it('should reject card with invalid network', () => {
      const invalidCard = { ...validCard, network: 'INVALID_NETWORK' }
      const result = CardSchema.safeParse(invalidCard)
      
      expect(result.success).toBe(false)
   
    })

    it('should reject card with invalid URL format', () => {
      const invalidCard = { ...validCard, baseImageUrl: 'not-a-url' }
      const result = CardSchema.safeParse(invalidCard)
      
      expect(result.success).toBe(false)
    })

    it('should handle null baseImageUrl', () => {
      const cardWithNullImage = { ...validCard, baseImageUrl: null }
      const result = CardSchema.safeParse(cardWithNullImage)
      
      expect(result.success).toBe(true)
    })
  })

  describe('CardBonusSchema', () => {
    const validBonus = {
      id: 'clp123456789',
      cardId: 'clp987654321',
      bonusPoints: 50000,
      pointType: 'AEROPLAN' as const,
      minimumSpendAmount: 3000,
      spendPeriodMonths: 3,
      description: 'Welcome bonus',
      isActive: true
    }

    it('should validate a complete valid bonus', () => {
      const result = CardBonusSchema.safeParse(validBonus)
      expect(result.success).toBe(true)
    })

    it('should reject bonus with zero points', () => {
      const invalidBonus = { ...validBonus, bonusPoints: 0 }
      const result = CardBonusSchema.safeParse(invalidBonus)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Bonus points must be positive')
      }
    })

    it('should reject bonus with negative minimum spend', () => {
      const invalidBonus = { ...validBonus, minimumSpendAmount: -100 }
      const result = CardBonusSchema.safeParse(invalidBonus)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Minimum spend must be non-negative')
      }
    })

    it('should reject bonus with zero spend period', () => {
      const invalidBonus = { ...validBonus, spendPeriodMonths: 0 }
      const result = CardBonusSchema.safeParse(invalidBonus)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Spend period must be at least 1 month')
      }
    })

    it('should reject bonus with invalid point type', () => {
      const invalidBonus = { ...validBonus, pointType: 'INVALID_POINTS' }
      const result = CardBonusSchema.safeParse(invalidBonus)
      
      expect(result.success).toBe(false)
    })

    it('should handle fractional bonus points', () => {
      const fractionalBonus = { ...validBonus, bonusPoints: 25000.5 }
      const result = CardBonusSchema.safeParse(fractionalBonus)
      
      expect(result.success).toBe(false) // Should be integer
    })
  })

  describe('CardMultiplierSchema', () => {
    const validMultiplier = {
      id: 'clp123456789',
      cardId: 'clp987654321',
      category: 'GROCERY' as const,
      multiplierValue: 2.5,
      description: '2.5x points on grocery',
      isActive: true
    }

    it('should validate a complete valid multiplier', () => {
      const result = CardMultiplierSchema.safeParse(validMultiplier)
      expect(result.success).toBe(true)
    })

    it('should reject multiplier with zero value', () => {
      const invalidMultiplier = { ...validMultiplier, multiplierValue: 0 }
      const result = CardMultiplierSchema.safeParse(invalidMultiplier)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Multiplier must be positive')
      }
    })

    it('should reject multiplier with negative value', () => {
      const invalidMultiplier = { ...validMultiplier, multiplierValue: -1.5 }
      const result = CardMultiplierSchema.safeParse(invalidMultiplier)
      
      expect(result.success).toBe(false)
    })

    it('should reject unrealistic multiplier values', () => {
      const unrealisticMultiplier = { ...validMultiplier, multiplierValue: 150 }
      const result = CardMultiplierSchema.safeParse(unrealisticMultiplier)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Multiplier seems unrealistic')
      }
    })

    it('should accept high but realistic multiplier values', () => {
      const highMultiplier = { ...validMultiplier, multiplierValue: 10 }
      const result = CardMultiplierSchema.safeParse(highMultiplier)
      
      expect(result.success).toBe(true)
    })

    it('should reject invalid spending category', () => {
      const invalidMultiplier = { ...validMultiplier, category: 'INVALID_CATEGORY' }
      const result = CardMultiplierSchema.safeParse(invalidMultiplier)
      
      expect(result.success).toBe(false)
    })
  })

  describe('GoalSchema', () => {
    const validGoal = {
      id: 'clp123456789',
      name: 'Trip to Europe',
      requiredPoints: 100000,
      pointType: 'AEROPLAN' as const,
      description: 'Round trip to Europe in business class',
      estimatedValue: 5000,
      isActive: true
    }

    it('should validate a complete valid goal', () => {
      const result = GoalSchema.safeParse(validGoal)
      expect(result.success).toBe(true)
    })

    it('should validate goal without optional fields', () => {
      const minimalGoal = {
        name: 'Basic Goal',
        requiredPoints: 25000,
        pointType: 'CASHBACK' as const
      }

      const result = GoalSchema.safeParse(minimalGoal)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isActive).toBe(true) // Default value
      }
    })

    it('should reject goal with empty name', () => {
      const invalidGoal = { ...validGoal, name: '' }
      const result = GoalSchema.safeParse(invalidGoal)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Goal name is required')
      }
    })

    it('should reject goal with zero required points', () => {
      const invalidGoal = { ...validGoal, requiredPoints: 0 }
      const result = GoalSchema.safeParse(invalidGoal)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Required points must be positive')
      }
    })

    it('should reject goal with negative estimated value', () => {
      const invalidGoal = { ...validGoal, estimatedValue: -100 }
      const result = GoalSchema.safeParse(invalidGoal)
      
      expect(result.success).toBe(false)
    })

    it('should handle fractional required points', () => {
      const fractionalGoal = { ...validGoal, requiredPoints: 25000.5 }
      const result = GoalSchema.safeParse(fractionalGoal)
      
      expect(result.success).toBe(false) // Should be integer
    })
  })

  describe('Create Schemas', () => {
    it('should omit id field in CreateCardSchema', () => {
      const cardData = {
        id: 'should-be-omitted',
        name: 'Test Card',
        bank: 'Test Bank',
        network: 'VISA' as const,
        annualFee: 100
      }

      const result = CreateCardSchema.safeParse(cardData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).not.toHaveProperty('id')
      }
    })

    it('should omit id field in CreateCardBonusSchema', () => {
      const bonusData = {
        id: 'should-be-omitted',
        cardId: 'clp123456789',
        bonusPoints: 25000,
        pointType: 'CASHBACK' as const,
        minimumSpendAmount: 1000,
        spendPeriodMonths: 3
      }

      const result = CreateCardBonusSchema.safeParse(bonusData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).not.toHaveProperty('id')
      }
    })

    it('should omit id field in CreateCardMultiplierSchema', () => {
      const multiplierData = {
        id: 'should-be-omitted',
        cardId: 'clp123456789',
        category: 'DINING' as const,
        multiplierValue: 3.0
      }

      const result = CreateCardMultiplierSchema.safeParse(multiplierData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).not.toHaveProperty('id')
      }
    })

    it('should omit id field in CreateGoalSchema', () => {
      const goalData = {
        id: 'should-be-omitted',
        name: 'Test Goal',
        requiredPoints: 50000,
        pointType: 'AEROPLAN' as const
      }

      const result = CreateGoalSchema.safeParse(goalData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).not.toHaveProperty('id')
      }
    })
  })

  describe('Edge Cases and Boundary Values', () => {
    it('should handle maximum safe integer values', () => {
      const maxCard = {
        name: 'Max Value Card',
        bank: 'Test Bank',
        network: 'VISA' as const,
        annualFee: Number.MAX_SAFE_INTEGER
      }

      const result = CardSchema.safeParse(maxCard)
      expect(result.success).toBe(true)
    })

    it('should handle very long strings', () => {
      const longName = 'A'.repeat(1000)
      const cardWithLongName = {
        name: longName,
        bank: 'Test Bank',
        network: 'VISA' as const,
        annualFee: 100
      }

      const result = CardSchema.safeParse(cardWithLongName)
      expect(result.success).toBe(true)
    })

    it('should handle special characters in names', () => {
      const specialCard = {
        name: 'TD® Aeroplan™ Visa* Infinite® Card',
        bank: 'TD Canada Trust',
        network: 'VISA' as const,
        annualFee: 139
      }

      const result = CardSchema.safeParse(specialCard)
      expect(result.success).toBe(true)
    })

    it('should handle Unicode characters', () => {
      const unicodeCard = {
        name: 'Carte de crédit Aéroplan',
        bank: 'Banque Royale du Canada',
        network: 'VISA' as const,
        annualFee: 139
      }

      const result = CardSchema.safeParse(unicodeCard)
      expect(result.success).toBe(true)
    })
  })
})