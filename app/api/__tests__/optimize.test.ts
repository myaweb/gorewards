import { NextRequest } from 'next/server'
import { POST } from '../optimize/cards/route'

// Mock the optimization engine
jest.mock('../../../../lib/services/cardOptimizationEngine', () => ({
  CardOptimizationEngine: {
    calculateBestCardPerCategory: jest.fn()
  }
}))

// Mock Clerk auth
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn()
}))

const { CardOptimizationEngine } = require('../../../../lib/services/cardOptimizationEngine')
const { auth } = require('@clerk/nextjs')

describe('/api/optimize/cards', () => {
  const mockOptimizationResult = {
    userId: 'user-123',
    optimizations: [
      {
        category: 'GROCERY',
        recommendedCard: {
          id: 'card-1',
          name: 'Grocery Rewards Card',
          bank: 'TD',
          network: 'Visa',
          imageUrl: '/card1.jpg'
        },
        multiplier: 3.0,
        pointType: 'CASHBACK',
        pointValue: 1.0,
        monthlySpending: 800,
        monthlyRewards: 2400,
        yearlyRewards: 28800,
        explanation: 'Best card for grocery spending',
        confidence: 95
      },
      {
        category: 'TRAVEL',
        recommendedCard: {
          id: 'card-2',
          name: 'Travel Rewards Card',
          bank: 'RBC',
          network: 'Mastercard',
          imageUrl: '/card2.jpg'
        },
        multiplier: 5.0,
        pointType: 'AEROPLAN',
        pointValue: 1.2,
        monthlySpending: 200,
        monthlyRewards: 1200,
        yearlyRewards: 14400,
        explanation: 'Excellent for travel purchases',
        confidence: 90
      }
    ],
    totalMonthlyRewards: 3600,
    totalYearlyRewards: 43200,
    summary: {
      bestOverallCard: {
        id: 'card-1',
        name: 'Grocery Rewards Card',
        categoriesCount: 1
      },
      totalCategories: 2,
      averageMultiplier: 4.0,
      estimatedAnnualValue: 43200
    },
    lastCalculated: new Date()
  }

  const validSpendingProfile = {
    grocery: 800,
    gas: 200,
    dining: 400,
    bills: 150,
    travel: 200,
    shopping: 250,
    entertainment: 100,
    utilities: 125,
    other: 75
  }

  beforeEach(() => {
    jest.clearAllMocks()
    auth.mockReturnValue({ userId: 'user-123' })
    CardOptimizationEngine.calculateBestCardPerCategory.mockResolvedValue(mockOptimizationResult)
  })

  describe('POST /api/optimize/cards', () => {
    it('should return optimization results for valid request', async () => {
      const request = new NextRequest('http://localhost:3000/api/optimize/cards', {
        method: 'POST',
        body: JSON.stringify({ spendingProfile: validSpendingProfile })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.optimizations).toHaveLength(2)
      expect(data.data.totalYearlyRewards).toBe(43200)
      expect(CardOptimizationEngine.calculateBestCardPerCategory).toHaveBeenCalledWith(
        'user-123',
        validSpendingProfile
      )
    })

    it('should return 401 for unauthenticated request', async () => {
      auth.mockReturnValue({ userId: null })

      const request = new NextRequest('http://localhost:3000/api/optimize/cards', {
        method: 'POST',
        body: JSON.stringify({ spendingProfile: validSpendingProfile })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 for missing spending profile', async () => {
      const request = new NextRequest('http://localhost:3000/api/optimize/cards', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('spendingProfile')
    })

    it('should handle negative spending values', async () => {
      const invalidSpendingProfile = {
        ...validSpendingProfile,
        grocery: -100,
        gas: -50
      }

      const request = new NextRequest('http://localhost:3000/api/optimize/cards', {
        method: 'POST',
        body: JSON.stringify({ spendingProfile: invalidSpendingProfile })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('validation')
    })

    it('should handle zero spending in all categories', async () => {
      const zeroSpendingProfile = {
        grocery: 0,
        gas: 0,
        dining: 0,
        bills: 0,
        travel: 0,
        shopping: 0,
        entertainment: 0,
        utilities: 0,
        other: 0
      }

      const emptyOptimizationResult = {
        ...mockOptimizationResult,
        optimizations: [],
        totalMonthlyRewards: 0,
        totalYearlyRewards: 0
      }

      CardOptimizationEngine.calculateBestCardPerCategory.mockResolvedValue(emptyOptimizationResult)

      const request = new NextRequest('http://localhost:3000/api/optimize/cards', {
        method: 'POST',
        body: JSON.stringify({ spendingProfile: zeroSpendingProfile })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.optimizations).toHaveLength(0)
      expect(data.data.totalYearlyRewards).toBe(0)
    })

    it('should handle very high spending amounts', async () => {
      const highSpendingProfile = {
        grocery: 50000,
        gas: 10000,
        dining: 25000,
        bills: 5000,
        travel: 100000,
        shopping: 30000,
        entertainment: 15000,
        utilities: 2000,
        other: 10000
      }

      const request = new NextRequest('http://localhost:3000/api/optimize/cards', {
        method: 'POST',
        body: JSON.stringify({ spendingProfile: highSpendingProfile })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle missing spending categories', async () => {
      const incompleteSpendingProfile = {
        grocery: 800,
        gas: 200
        // Missing other categories
      }

      const request = new NextRequest('http://localhost:3000/api/optimize/cards', {
        method: 'POST',
        body: JSON.stringify({ spendingProfile: incompleteSpendingProfile })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle invalid spending data types', async () => {
      const invalidSpendingProfile = {
        grocery: 'invalid',
        gas: null,
        dining: undefined,
        bills: NaN,
        travel: Infinity,
        shopping: 200,
        entertainment: 100,
        utilities: 125,
        other: 75
      }

      const request = new NextRequest('http://localhost:3000/api/optimize/cards', {
        method: 'POST',
        body: JSON.stringify({ spendingProfile: invalidSpendingProfile })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should handle optimization engine errors', async () => {
      CardOptimizationEngine.calculateBestCardPerCategory.mockRejectedValue(
        new Error('User has no active cards for optimization')
      )

      const request = new NextRequest('http://localhost:3000/api/optimize/cards', {
        method: 'POST',
        body: JSON.stringify({ spendingProfile: validSpendingProfile })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('no active cards')
    })

    it('should handle database connection errors', async () => {
      CardOptimizationEngine.calculateBestCardPerCategory.mockRejectedValue(
        new Error('Database connection failed')
      )

      const request = new NextRequest('http://localhost:3000/api/optimize/cards', {
        method: 'POST',
        body: JSON.stringify({ spendingProfile: validSpendingProfile })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Internal server error')
    })

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/optimize/cards', {
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
      const request = new NextRequest('http://localhost:3000/api/optimize/cards', {
        method: 'POST',
        body: ''
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should validate spending profile structure', async () => {
      const invalidStructure = {
        spendingProfile: {
          invalidCategory: 500,
          anotherInvalid: 300
        }
      }

      const request = new NextRequest('http://localhost:3000/api/optimize/cards', {
        method: 'POST',
        body: JSON.stringify(invalidStructure)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should return consistent response format', async () => {
      const request = new NextRequest('http://localhost:3000/api/optimize/cards', {
        method: 'POST',
        body: JSON.stringify({ spendingProfile: validSpendingProfile })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('optimizations')
      expect(data.data).toHaveProperty('totalMonthlyRewards')
      expect(data.data).toHaveProperty('totalYearlyRewards')
      expect(data.data).toHaveProperty('summary')
      expect(Array.isArray(data.data.optimizations)).toBe(true)
    })
  })

  describe('Response Validation', () => {
    it('should include all required optimization fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/optimize/cards', {
        method: 'POST',
        body: JSON.stringify({ spendingProfile: validSpendingProfile })
      })

      const response = await POST(request)
      const data = await response.json()

      const optimization = data.data.optimizations[0]
      expect(optimization).toHaveProperty('category')
      expect(optimization).toHaveProperty('recommendedCard')
      expect(optimization).toHaveProperty('multiplier')
      expect(optimization).toHaveProperty('pointType')
      expect(optimization).toHaveProperty('monthlySpending')
      expect(optimization).toHaveProperty('monthlyRewards')
      expect(optimization).toHaveProperty('yearlyRewards')
      expect(optimization).toHaveProperty('explanation')
      expect(optimization).toHaveProperty('confidence')

      expect(optimization.recommendedCard).toHaveProperty('id')
      expect(optimization.recommendedCard).toHaveProperty('name')
      expect(optimization.recommendedCard).toHaveProperty('bank')
      expect(optimization.recommendedCard).toHaveProperty('network')
    })

    it('should include summary with aggregated data', async () => {
      const request = new NextRequest('http://localhost:3000/api/optimize/cards', {
        method: 'POST',
        body: JSON.stringify({ spendingProfile: validSpendingProfile })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.data.summary).toHaveProperty('bestOverallCard')
      expect(data.data.summary).toHaveProperty('totalCategories')
      expect(data.data.summary).toHaveProperty('averageMultiplier')
      expect(data.data.summary).toHaveProperty('estimatedAnnualValue')

      expect(typeof data.data.summary.totalCategories).toBe('number')
      expect(typeof data.data.summary.averageMultiplier).toBe('number')
      expect(typeof data.data.summary.estimatedAnnualValue).toBe('number')
    })

    it('should have consistent numeric types', async () => {
      const request = new NextRequest('http://localhost:3000/api/optimize/cards', {
        method: 'POST',
        body: JSON.stringify({ spendingProfile: validSpendingProfile })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(typeof data.data.totalMonthlyRewards).toBe('number')
      expect(typeof data.data.totalYearlyRewards).toBe('number')

      data.data.optimizations.forEach((opt: any) => {
        expect(typeof opt.multiplier).toBe('number')
        expect(typeof opt.monthlySpending).toBe('number')
        expect(typeof opt.monthlyRewards).toBe('number')
        expect(typeof opt.yearlyRewards).toBe('number')
        expect(typeof opt.confidence).toBe('number')
      })
    })
  })
})
