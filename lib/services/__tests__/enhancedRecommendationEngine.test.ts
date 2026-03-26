import { EnhancedRecommendationEngine } from '../enhancedRecommendationEngine'
import { CreditScoreRange } from '../../types/recommendation'

// Mock CardService
jest.mock('../cardService', () => ({
  CardService: {
    getAllCardsWithDetails: jest.fn()
  }
}))

describe('EnhancedRecommendationEngine', () => {
  const mockUserProfile = {
    spending: {
      grocery: 800,
      gas: 200,
      dining: 400,
      bills: 150,
      travel: 100,
      shopping: 200
    },
    creditScore: CreditScoreRange.GOOD,
    annualIncome: 75000,
    preferredPointTypes: ['AEROPLAN', 'CASHBACK'],
    maxAnnualFee: 200,
    prioritizeSignupBonus: true,
    timeHorizon: 'LONG_TERM' as const
  }

  const mockCard = {
    id: 'test-card-1',
    name: 'Test Aeroplan Card',
    bank: 'TD',
    network: 'Visa',
    annualFee: { toString: () => '120' },
    baseRewardRate: { toString: () => '0.01' },
    imageUrl: '/test-image.jpg',
    affiliateLink: '/test-link',
    slug: 'test-card',
    bonuses: [{
      id: 'bonus-1',
      bonusPoints: 45000,
      pointType: 'AEROPLAN',
      minimumSpendAmount: { toString: () => '3000' },
      spendPeriodMonths: 3,
      estimatedValue: { toString: () => '540' },
      description: 'Welcome bonus'
    }],
    multipliers: [{
      id: 'mult-1',
      category: 'GROCERY',
      multiplierValue: { toString: () => '2.0' },
      description: '2x points on grocery',
      monthlyLimit: null,
      annualLimit: null
    }]
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate recommendations successfully', async () => {
    // Mock the CardService response
    require('../cardService').CardService.getAllCardsWithDetails.mockResolvedValue([mockCard])

    const result = await EnhancedRecommendationEngine.getRecommendations(mockUserProfile)

    expect(result).toBeDefined()
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0].card.name).toBe('Test Aeroplan Card')
    expect(result.recommendations[0].scores.approvalProbability).toBeGreaterThan(0)
    expect(result.metadata.totalCardsEvaluated).toBe(1)
  })
})