import { CardDataUpdateService } from '../cardDataUpdateService'
import { UpdateType, UpdateStatus } from '../../types/cardDataUpdate'

// Mock Prisma
jest.mock('../../prisma', () => ({
  prisma: {
    cardDataUpdate: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn()
    },
    card: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn()
    },
    cardBonus: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn()
    },
    cardMultiplier: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn()
    }
  }
}))

const { prisma } = require('../../prisma')

describe('CardDataUpdateService', () => {
  const mockUpdateRecord = {
    id: 'update-1',
    updateType: UpdateType.CARD_UPDATE,
    status: UpdateStatus.PENDING,
    cardId: 'card-1',
    updateData: {
      annualFee: 150,
      baseRewardRate: 0.015
    },
    source: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    processedAt: null,
    errorMessage: null
  }

  const mockCard = {
    id: 'card-1',
    name: 'Test Card',
    bank: 'TD',
    network: 'Visa',
    annualFee: 120,
    baseRewardRate: 0.01,
    isActive: true
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createUpdate', () => {
    it('should create a new card update record', async () => {
      prisma.cardDataUpdate.create.mockResolvedValue(mockUpdateRecord)

      const updateData = {
        updateType: UpdateType.CARD_UPDATE,
        cardId: 'card-1',
        updateData: { annualFee: 150 },
        source: 'admin'
      }

      const result = await CardDataUpdateService.createUpdate(updateData)

      expect(prisma.cardDataUpdate.create).toHaveBeenCalledWith({
        data: {
          updateType: UpdateType.CARD_UPDATE,
          cardId: 'card-1',
          updateData: { annualFee: 150 },
          source: 'admin',
          status: UpdateStatus.PENDING
        }
      })

      expect(result.id).toBe('update-1')
      expect(result.status).toBe(UpdateStatus.PENDING)
    })

    it('should create bonus update record', async () => {
      const bonusUpdateRecord = {
        ...mockUpdateRecord,
        updateType: UpdateType.BONUS_UPDATE,
        updateData: {
          bonusPoints: 50000,
          minimumSpendAmount: 3000,
          spendPeriodMonths: 3
        }
      }

      prisma.cardDataUpdate.create.mockResolvedValue(bonusUpdateRecord)

      const updateData = {
        updateType: UpdateType.BONUS_UPDATE,
        cardId: 'card-1',
        updateData: {
          bonusPoints: 50000,
          minimumSpendAmount: 3000,
          spendPeriodMonths: 3
        },
        source: 'scraper'
      }

      const result = await CardDataUpdateService.createUpdate(updateData)

      expect(result.updateType).toBe(UpdateType.BONUS_UPDATE)
      expect(result.updateData.bonusPoints).toBe(50000)
    })

    it('should create multiplier update record', async () => {
      const multiplierUpdateRecord = {
        ...mockUpdateRecord,
        updateType: UpdateType.MULTIPLIER_UPDATE,
        updateData: {
          category: 'GROCERY',
          multiplierValue: 3.0,
          monthlyLimit: 1000
        }
      }

      prisma.cardDataUpdate.create.mockResolvedValue(multiplierUpdateRecord)

      const updateData = {
        updateType: UpdateType.MULTIPLIER_UPDATE,
        cardId: 'card-1',
        updateData: {
          category: 'GROCERY',
          multiplierValue: 3.0,
          monthlyLimit: 1000
        },
        source: 'api'
      }

      const result = await CardDataUpdateService.createUpdate(updateData)

      expect(result.updateType).toBe(UpdateType.MULTIPLIER_UPDATE)
      expect(result.updateData.category).toBe('GROCERY')
    })

    it('should handle validation errors', async () => {
      prisma.cardDataUpdate.create.mockRejectedValue(new Error('Validation failed'))

      const invalidUpdateData = {
        updateType: 'INVALID_TYPE' as any,
        cardId: '',
        updateData: {},
        source: ''
      }

      await expect(
        CardDataUpdateService.createUpdate(invalidUpdateData)
      ).rejects.toThrow('Validation failed')
    })
  })

  describe('processUpdate', () => {
    it('should process card update successfully', async () => {
      prisma.cardDataUpdate.findUnique.mockResolvedValue(mockUpdateRecord)
      prisma.card.findUnique.mockResolvedValue(mockCard)
      prisma.card.update.mockResolvedValue({ ...mockCard, annualFee: 150 })
      
      const processedUpdate = {
        ...mockUpdateRecord,
        status: UpdateStatus.COMPLETED,
        processedAt: new Date()
      }
      prisma.cardDataUpdate.update.mockResolvedValue(processedUpdate)

      const result = await CardDataUpdateService.processUpdate('update-1')

      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: 'card-1' },
        data: { annualFee: 150, baseRewardRate: 0.015 }
      })

      expect(prisma.cardDataUpdate.update).toHaveBeenCalledWith({
        where: { id: 'update-1' },
        data: {
          status: UpdateStatus.COMPLETED,
          processedAt: expect.any(Date)
        }
      })

      expect(result.status).toBe(UpdateStatus.COMPLETED)
    })

    it('should process bonus update successfully', async () => {
      const bonusUpdate = {
        ...mockUpdateRecord,
        updateType: UpdateType.BONUS_UPDATE,
        updateData: {
          bonusId: 'bonus-1',
          bonusPoints: 60000,
          minimumSpendAmount: 4000
        }
      }

      prisma.cardDataUpdate.findUnique.mockResolvedValue(bonusUpdate)
      prisma.card.findUnique.mockResolvedValue(mockCard)
      prisma.cardBonus.update.mockResolvedValue({})
      prisma.cardDataUpdate.update.mockResolvedValue({
        ...bonusUpdate,
        status: UpdateStatus.COMPLETED
      })

      const result = await CardDataUpdateService.processUpdate('update-1')

      expect(prisma.cardBonus.update).toHaveBeenCalledWith({
        where: { id: 'bonus-1' },
        data: {
          bonusPoints: 60000,
          minimumSpendAmount: 4000
        }
      })

      expect(result.status).toBe(UpdateStatus.COMPLETED)
    })

    it('should process multiplier update successfully', async () => {
      const multiplierUpdate = {
        ...mockUpdateRecord,
        updateType: UpdateType.MULTIPLIER_UPDATE,
        updateData: {
          multiplierId: 'mult-1',
          multiplierValue: 4.0,
          monthlyLimit: 2000
        }
      }

      prisma.cardDataUpdate.findUnique.mockResolvedValue(multiplierUpdate)
      prisma.card.findUnique.mockResolvedValue(mockCard)
      prisma.cardMultiplier.update.mockResolvedValue({})
      prisma.cardDataUpdate.update.mockResolvedValue({
        ...multiplierUpdate,
        status: UpdateStatus.COMPLETED
      })

      const result = await CardDataUpdateService.processUpdate('update-1')

      expect(prisma.cardMultiplier.update).toHaveBeenCalledWith({
        where: { id: 'mult-1' },
        data: {
          multiplierValue: 4.0,
          monthlyLimit: 2000
        }
      })

      expect(result.status).toBe(UpdateStatus.COMPLETED)
    })

    it('should handle non-existent update record', async () => {
      prisma.cardDataUpdate.findUnique.mockResolvedValue(null)

      await expect(
        CardDataUpdateService.processUpdate('non-existent')
      ).rejects.toThrow('Update record not found')
    })

    it('should handle non-existent card', async () => {
      prisma.cardDataUpdate.findUnique.mockResolvedValue(mockUpdateRecord)
      prisma.card.findUnique.mockResolvedValue(null)

      const result = await CardDataUpdateService.processUpdate('update-1')

      expect(prisma.cardDataUpdate.update).toHaveBeenCalledWith({
        where: { id: 'update-1' },
        data: {
          status: UpdateStatus.FAILED,
          errorMessage: 'Card not found: card-1',
          processedAt: expect.any(Date)
        }
      })

      expect(result.status).toBe(UpdateStatus.FAILED)
    })

    it('should handle processing errors', async () => {
      prisma.cardDataUpdate.findUnique.mockResolvedValue(mockUpdateRecord)
      prisma.card.findUnique.mockResolvedValue(mockCard)
      prisma.card.update.mockRejectedValue(new Error('Database constraint violation'))

      const result = await CardDataUpdateService.processUpdate('update-1')

      expect(prisma.cardDataUpdate.update).toHaveBeenCalledWith({
        where: { id: 'update-1' },
        data: {
          status: UpdateStatus.FAILED,
          errorMessage: 'Database constraint violation',
          processedAt: expect.any(Date)
        }
      })

      expect(result.status).toBe(UpdateStatus.FAILED)
    })

    it('should skip already processed updates', async () => {
      const completedUpdate = {
        ...mockUpdateRecord,
        status: UpdateStatus.COMPLETED,
        processedAt: new Date()
      }

      prisma.cardDataUpdate.findUnique.mockResolvedValue(completedUpdate)

      const result = await CardDataUpdateService.processUpdate('update-1')

      expect(prisma.card.update).not.toHaveBeenCalled()
      expect(result.status).toBe(UpdateStatus.COMPLETED)
    })
  })

  describe('getPendingUpdates', () => {
    it('should fetch pending updates', async () => {
      const pendingUpdates = [
        mockUpdateRecord,
        { ...mockUpdateRecord, id: 'update-2', cardId: 'card-2' }
      ]

      prisma.cardDataUpdate.findMany.mockResolvedValue(pendingUpdates)

      const result = await CardDataUpdateService.getPendingUpdates()

      expect(prisma.cardDataUpdate.findMany).toHaveBeenCalledWith({
        where: { status: UpdateStatus.PENDING },
        orderBy: { createdAt: 'asc' },
        take: 100
      })

      expect(result).toHaveLength(2)
      expect(result[0].status).toBe(UpdateStatus.PENDING)
    })

    it('should respect limit parameter', async () => {
      prisma.cardDataUpdate.findMany.mockResolvedValue([mockUpdateRecord])

      await CardDataUpdateService.getPendingUpdates(50)

      expect(prisma.cardDataUpdate.findMany).toHaveBeenCalledWith({
        where: { status: UpdateStatus.PENDING },
        orderBy: { createdAt: 'asc' },
        take: 50
      })
    })

    it('should handle empty results', async () => {
      prisma.cardDataUpdate.findMany.mockResolvedValue([])

      const result = await CardDataUpdateService.getPendingUpdates()

      expect(result).toHaveLength(0)
    })
  })

  describe('getUpdateHistory', () => {
    it('should fetch update history for a card', async () => {
      const updateHistory = [
        mockUpdateRecord,
        { ...mockUpdateRecord, id: 'update-2', status: UpdateStatus.COMPLETED }
      ]

      prisma.cardDataUpdate.findMany.mockResolvedValue(updateHistory)

      const result = await CardDataUpdateService.getUpdateHistory('card-1')

      expect(prisma.cardDataUpdate.findMany).toHaveBeenCalledWith({
        where: { cardId: 'card-1' },
        orderBy: { createdAt: 'desc' },
        take: 50
      })

      expect(result).toHaveLength(2)
    })

    it('should handle card with no update history', async () => {
      prisma.cardDataUpdate.findMany.mockResolvedValue([])

      const result = await CardDataUpdateService.getUpdateHistory('card-no-updates')

      expect(result).toHaveLength(0)
    })
  })

  describe('getUpdateStatistics', () => {
    it('should return comprehensive update statistics', async () => {
      prisma.cardDataUpdate.count.mockResolvedValueOnce(100) // total
      prisma.cardDataUpdate.count.mockResolvedValueOnce(25)  // pending
      prisma.cardDataUpdate.count.mockResolvedValueOnce(60)  // completed
      prisma.cardDataUpdate.count.mockResolvedValueOnce(15)  // failed

      const result = await CardDataUpdateService.getUpdateStatistics()

      expect(result.total).toBe(100)
      expect(result.pending).toBe(25)
      expect(result.completed).toBe(60)
      expect(result.failed).toBe(15)
      expect(result.successRate).toBe(80) // 60/75 * 100
    })

    it('should handle zero statistics', async () => {
      prisma.cardDataUpdate.count.mockResolvedValue(0)

      const result = await CardDataUpdateService.getUpdateStatistics()

      expect(result.total).toBe(0)
      expect(result.pending).toBe(0)
      expect(result.completed).toBe(0)
      expect(result.failed).toBe(0)
      expect(result.successRate).toBe(0)
    })

    it('should calculate success rate correctly with no processed updates', async () => {
      prisma.cardDataUpdate.count.mockResolvedValueOnce(10) // total
      prisma.cardDataUpdate.count.mockResolvedValueOnce(10) // pending
      prisma.cardDataUpdate.count.mockResolvedValueOnce(0)  // completed
      prisma.cardDataUpdate.count.mockResolvedValueOnce(0)  // failed

      const result = await CardDataUpdateService.getUpdateStatistics()

      expect(result.successRate).toBe(0) // No processed updates yet
    })
  })

  describe('Edge Cases', () => {
    it('should handle invalid update data gracefully', async () => {
      const invalidUpdate = {
        ...mockUpdateRecord,
        updateData: null
      }

      prisma.cardDataUpdate.findUnique.mockResolvedValue(invalidUpdate)

      const result = await CardDataUpdateService.processUpdate('update-1')

      expect(result.status).toBe(UpdateStatus.FAILED)
      expect(result.errorMessage).toContain('Invalid update data')
    })

    it('should handle concurrent processing attempts', async () => {
      const processingUpdate = {
        ...mockUpdateRecord,
        status: UpdateStatus.PROCESSING
      }

      prisma.cardDataUpdate.findUnique.mockResolvedValue(processingUpdate)

      const result = await CardDataUpdateService.processUpdate('update-1')

      expect(result.status).toBe(UpdateStatus.PROCESSING)
      expect(prisma.card.update).not.toHaveBeenCalled()
    })

    it('should handle database connection errors', async () => {
      prisma.cardDataUpdate.findUnique.mockRejectedValue(new Error('Connection timeout'))

      await expect(
        CardDataUpdateService.processUpdate('update-1')
      ).rejects.toThrow('Connection timeout')
    })

    it('should validate update data types', async () => {
      const invalidTypeUpdate = {
        ...mockUpdateRecord,
        updateData: {
          annualFee: 'invalid-number',
          baseRewardRate: 'not-a-decimal'
        }
      }

      prisma.cardDataUpdate.findUnique.mockResolvedValue(invalidTypeUpdate)
      prisma.card.findUnique.mockResolvedValue(mockCard)

      const result = await CardDataUpdateService.processUpdate('update-1')

      expect(result.status).toBe(UpdateStatus.FAILED)
      expect(result.errorMessage).toContain('Invalid data type')
    })
  })

  describe('Batch Processing', () => {
    it('should process multiple updates in batch', async () => {
      const pendingUpdates = [
        mockUpdateRecord,
        { ...mockUpdateRecord, id: 'update-2', cardId: 'card-2' },
        { ...mockUpdateRecord, id: 'update-3', cardId: 'card-3' }
      ]

      prisma.cardDataUpdate.findMany.mockResolvedValue(pendingUpdates)
      
      // Mock successful processing for all updates
      prisma.cardDataUpdate.findUnique
        .mockResolvedValueOnce(pendingUpdates[0])
        .mockResolvedValueOnce(pendingUpdates[1])
        .mockResolvedValueOnce(pendingUpdates[2])
      
      prisma.card.findUnique.mockResolvedValue(mockCard)
      prisma.card.update.mockResolvedValue(mockCard)
      prisma.cardDataUpdate.update.mockResolvedValue({
        ...mockUpdateRecord,
        status: UpdateStatus.COMPLETED
      })

      const results = await CardDataUpdateService.processPendingUpdates()

      expect(results.processed).toBe(3)
      expect(results.successful).toBe(3)
      expect(results.failed).toBe(0)
    })

    it('should handle mixed success and failure in batch', async () => {
      const pendingUpdates = [
        mockUpdateRecord,
        { ...mockUpdateRecord, id: 'update-2', cardId: 'non-existent-card' }
      ]

      prisma.cardDataUpdate.findMany.mockResolvedValue(pendingUpdates)
      
      prisma.cardDataUpdate.findUnique
        .mockResolvedValueOnce(pendingUpdates[0])
        .mockResolvedValueOnce(pendingUpdates[1])
      
      prisma.card.findUnique
        .mockResolvedValueOnce(mockCard)
        .mockResolvedValueOnce(null) // Card not found
      
      prisma.card.update.mockResolvedValue(mockCard)
      prisma.cardDataUpdate.update
        .mockResolvedValueOnce({ ...mockUpdateRecord, status: UpdateStatus.COMPLETED })
        .mockResolvedValueOnce({ ...mockUpdateRecord, status: UpdateStatus.FAILED })

      const results = await CardDataUpdateService.processPendingUpdates()

      expect(results.processed).toBe(2)
      expect(results.successful).toBe(1)
      expect(results.failed).toBe(1)
    })
  })
})