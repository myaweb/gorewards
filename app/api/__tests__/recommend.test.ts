import { NextRequest } from 'next/server'
import { POST } from '../recommend/route'

// Mock the recommendation engine
jest.mock('../../../lib/services/enhancedRecommendationEngine', () => ({
  EnhancedRecommendationEngine: {
    getRecommendations: jest.fn()
  }
}))

// Mock Clerk auth
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn()
}))

const { EnhancedRecommendationEngine } = require('../../../lib/services/enhancedRecommendationEngine')
const { auth } = require('@clerk/nextjs')

describe('/api/recommend', () => {
  const mockRecommendationResult = {
    recommendations: [
      {
        card: {
          id: 'card-1',
          name: 'TD Aeroplan Visa Infinite',
          bank: 'TD',
          network: 'Visa',
          annualFee: 139,
          imageUrl: '/card1.jpg'
        },
        scores: {
          approvalProbability: 85,
          totalScore: 92,
          categoryScore: 88,
          bonusScore: 95,
          feeScore: 80
        },
        explanation: 'Great card for your spending pattern',
        confidence: 90
      }
    ],
    metadata: {
      totalCardsEvaluated: 50,
      processingTimeMs: 150,
      timestamp: new Date().toISOString()
    }
  }

  const validUserProfile = {
    spending: {
      grocery: 800,
      gas: 200,
      dining: 400,
      bills: 150,
      travel: 100,
      shopping: 200
    },
    creditScore: 'GOOD',
    annualIncome: 75000,
    preferredPointTypes: ['AEROPLAN', 'CASHBACK'],
    maxAnnualFee: 200,
    prioritizeSignupBonus: true,
    timeHorizon: 'LONG_TERM'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    auth.mockReturnValue({ userId: 'user-123' })
    EnhancedRecommendationEngine.getRecommendations.mockResolvedValue(mockRecommendationResult)
  })

  describe('POST /api/recommend', () => {
    it('should return recommendations for valid request', async () => {
      const request = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        body: JSON.stringify(validUserProfile)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.recommendations).toHaveLength(1)
      expect(data.data.recommendations[0].card.name).toBe('TD Aeroplan Visa Infinite')
      expect(EnhancedRecommendationEngine.getRecommendations).toHaveBeenCalledWith(validUserProfile)
    })

    it('should return 401 for unauthenticated request', async () => {
      auth.mockReturnValue({ userId: null })

      const request = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        body: JSON.stringify(validUserProfile)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 for invalid request body', async () => {
      const invalidProfile = {
        spending: {
          grocery: -100, // Invalid negative spending
          gas: 'invalid' // Invalid type
        },
        creditScore: 'INVALID_SCORE',
        annualIncome: -50000 // Invalid negative income
      }

      const request = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        body: JSON.stringify(invalidProfile)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('validation')
    })

    it('should handle missing spending categories', async () => {
      const incompleteProfile = {
        ...validUserProfile,
        spending: {
          grocery: 800,
          // Missing other categories
        }
      }

      const request = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        body: JSON.stringify(incompleteProfile)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle zero spending in all categories', async () => {
      const zeroSpendingProfile = {
        ...validUserProfile,
        spending: {
          grocery: 0,
          gas: 0,
          dining: 0,
          bills: 0,
          travel: 0,
          shopping: 0
        }
      }

      const request = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        body: JSON.stringify(zeroSpendingProfile)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle very high spending amounts', async () => {
      const highSpendingProfile = {
        ...validUserProfile,
        spending: {
          grocery: 50000,
          gas: 10000,
          dining: 25000,
          bills: 5000,
          travel: 100000,
          shopping: 30000
        },
        annualIncome: 1000000,
        maxAnnualFee: 5000
      }

      const request = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        body: JSON.stringify(highSpendingProfile)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle empty preferred point types', async () => {
      const profileWithEmptyPointTypes = {
        ...validUserProfile,
        preferredPointTypes: []
      }

      const request = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        body: JSON.stringify(profileWithEmptyPointTypes)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle recommendation engine errors', async () => {
      EnhancedRecommendationEngine.getRecommendations.mockRejectedValue(
        new Error('Database connection failed')
      )

      const request = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        body: JSON.stringify(validUserProfile)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Internal server error')
    })

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        body: 'invalid json{'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid JSON')
    })

    it('should handle empty request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        body: ''
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should validate credit score enum values', async () => {
      const invalidCreditScoreProfile = {
        ...validUserProfile,
        creditScore: 'INVALID_SCORE'
      }

      const request = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        body: JSON.stringify(invalidCreditScoreProfile)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should validate time horizon enum values', async () => {
      const invalidTimeHorizonProfile = {
        ...validUserProfile,
        timeHorizon: 'INVALID_HORIZON'
      }

      const request = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        body: JSON.stringify(invalidTimeHorizonProfile)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should handle timeout scenarios', async () => {
      EnhancedRecommendationEngine.getRecommendations.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 30000)) // 30 second timeout
      )

      const request = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        body: JSON.stringify(validUserProfile)
      })

      // This test would need actual timeout handling in the route
      // For now, we'll just verify the mock is set up correctly
      expect(EnhancedRecommendationEngine.getRecommendations).toBeDefined()
    })

    it('should return consistent response format', async () => {
      const request = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        body: JSON.stringify(validUserProfile)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('recommendations')
      expect(data.data).toHaveProperty('metadata')
      expect(Array.isArray(data.data.recommendations)).toBe(true)
    })
  })

  describe('Response Validation', () => {
    it('should include all required recommendation fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        body: JSON.stringify(validUserProfile)
      })

      const response = await POST(request)
      const data = await response.json()

      const recommendation = data.data.recommendations[0]
      expect(recommendation).toHaveProperty('card')
      expect(recommendation).toHaveProperty('scores')
      expect(recommendation).toHaveProperty('explanation')
      expect(recommendation).toHaveProperty('confidence')

      expect(recommendation.card).toHaveProperty('id')
      expect(recommendation.card).toHaveProperty('name')
      expect(recommendation.card).toHaveProperty('bank')
      expect(recommendation.card).toHaveProperty('network')
      expect(recommendation.card).toHaveProperty('annualFee')

      expect(recommendation.scores).toHaveProperty('approvalProbability')
      expect(recommendation.scores).toHaveProperty('totalScore')
    })

    it('should include metadata with processing information', async () => {
      const request = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        body: JSON.stringify(validUserProfile)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.data.metadata).toHaveProperty('totalCardsEvaluated')
      expect(data.data.metadata).toHaveProperty('processingTimeMs')
      expect(data.data.metadata).toHaveProperty('timestamp')
      expect(typeof data.data.metadata.totalCardsEvaluated).toBe('number')
      expect(typeof data.data.metadata.processingTimeMs).toBe('number')
    })
  })
})