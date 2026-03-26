import { RouteEngine } from '../routeEngine'
import type { SpendingProfile, CardWithDetails } from '../../types/spending'

describe('RouteEngine', () => {
  const mockSpending: SpendingProfile = {
    grocery: 800,
    gas: 200,
    dining: 400,
    recurring: 600,
  }

  const mockGoal = {
    id: 'goal-1',
    name: 'Flight to Europe',
    requiredPoints: 50000,
    pointType: 'AEROPLAN',
  }

  const mockCards: CardWithDetails[] = [
    {
      id: 'card-1',
      name: 'Premium Travel Card',
      bank: 'TD',
      network: 'VISA',
      annualFee: 139,
      baseRewardRate: 0.01,
      bonuses: [
        {
          id: 'bonus-1',
          bonusPoints: 30000,
          pointType: 'AEROPLAN',
          minimumSpendAmount: 3000,
          spendPeriodMonths: 3,
        },
      ],
      multipliers: [
        { id: 'm1', category: 'GROCERY', multiplierValue: 3 },
        { id: 'm2', category: 'GAS', multiplierValue: 2 },
        { id: 'm3', category: 'DINING', multiplierValue: 2 },
        { id: 'm4', category: 'RECURRING', multiplierValue: 1 },
      ],
    },
    {
      id: 'card-2',
      name: 'Cashback Plus Card',
      bank: 'RBC',
      network: 'MASTERCARD',
      annualFee: 0,
      baseRewardRate: 0.01,
      bonuses: [
        {
          id: 'bonus-2',
          bonusPoints: 15000,
          pointType: 'AEROPLAN',
          minimumSpendAmount: 1500,
          spendPeriodMonths: 3,
        },
      ],
      multipliers: [
        { id: 'm5', category: 'GROCERY', multiplierValue: 2 },
        { id: 'm6', category: 'GAS', multiplierValue: 1.5 },
        { id: 'm7', category: 'DINING', multiplierValue: 1 },
        { id: 'm8', category: 'RECURRING', multiplierValue: 1 },
      ],
    },
  ]

  describe('calculateOptimalRoadmap', () => {
    it('should generate a valid roadmap', () => {
      const roadmap = RouteEngine.calculateOptimalRoadmap(
        mockSpending,
        mockGoal,
        mockCards
      )

      expect(roadmap).toBeDefined()
      expect(roadmap.steps.length).toBeGreaterThan(0)
      expect(roadmap.totalMonths).toBeGreaterThan(0)
      expect(roadmap.goalAchieved).toBeDefined()
    })

    it('should include application and usage steps', () => {
      const roadmap = RouteEngine.calculateOptimalRoadmap(
        mockSpending,
        mockGoal,
        mockCards
      )

      const applicationSteps = roadmap.steps.filter(s => s.action === 'APPLY')
      const usageSteps = roadmap.steps.filter(s => s.action === 'USE')

      expect(applicationSteps.length).toBeGreaterThan(0)
      expect(usageSteps.length).toBeGreaterThan(0)
    })

    it('should accumulate points correctly', () => {
      const roadmap = RouteEngine.calculateOptimalRoadmap(
        mockSpending,
        mockGoal,
        mockCards
      )

      // Points should increase monotonically
      for (let i = 1; i < roadmap.steps.length; i++) {
        expect(roadmap.steps[i].cumulativePoints).toBeGreaterThanOrEqual(
          roadmap.steps[i - 1].cumulativePoints
        )
      }
    })

    it('should throw error for zero spending', () => {
      const zeroSpending: SpendingProfile = {
        grocery: 0,
        gas: 0,
        dining: 0,
        recurring: 0,
      }

      expect(() =>
        RouteEngine.calculateOptimalRoadmap(zeroSpending, mockGoal, mockCards)
      ).toThrow('Monthly spending must be greater than zero')
    })

    it('should throw error when no matching cards', () => {
      const differentGoal = {
        ...mockGoal,
        pointType: 'NONEXISTENT_TYPE',
      }

      expect(() =>
        RouteEngine.calculateOptimalRoadmap(mockSpending, differentGoal, mockCards)
      ).toThrow('No cards available for point type')
    })
  })

  describe('validateSpendingProfile', () => {
    it('should validate correct spending profile', () => {
      expect(RouteEngine.validateSpendingProfile(mockSpending)).toBe(true)
    })

    it('should reject negative spending', () => {
      const invalidSpending: SpendingProfile = {
        grocery: -100,
        gas: 200,
        dining: 400,
        recurring: 600,
      }

      expect(RouteEngine.validateSpendingProfile(invalidSpending)).toBe(false)
    })
  })

  describe('calculateBonusCompletionTime', () => {
    it('should calculate correct completion time', () => {
      const months = RouteEngine.calculateBonusCompletionTime(3000, 2000)
      expect(months).toBe(2)
    })

    it('should round up partial months', () => {
      const months = RouteEngine.calculateBonusCompletionTime(3000, 1000)
      expect(months).toBe(3)
    })

    it('should return Infinity for zero spending', () => {
      const months = RouteEngine.calculateBonusCompletionTime(3000, 0)
      expect(months).toBe(Infinity)
    })
  })

  describe('compareCards', () => {
    it('should compare two cards correctly', () => {
      const comparison = RouteEngine.compareCards(
        mockCards[0],
        mockCards[1],
        mockSpending,
        'AEROPLAN',
        12
      )

      expect(comparison).toBeDefined()
      expect(comparison.betterCard).toBeDefined()
      expect(comparison.card1Value).toBeGreaterThan(0)
      expect(comparison.card2Value).toBeGreaterThan(0)
      expect(comparison.difference).toBeGreaterThanOrEqual(0)
    })
  })
})
