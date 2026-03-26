import { prisma } from '../prisma'
import type { ParsedCard } from './aiCardParser'

export interface CreateUpdateData {
  updateType: string
  cardId: string
  updateData: any
  source: string
  oldData?: any
}

export interface CardDiff {
  cardId: string
  cardName: string
  changes: FieldChange[]
  source: string
}

export interface FieldChange {
  field: string
  oldValue: string | number
  newValue: string | number
}

export class CardDataUpdateService {
  /**
   * Create a new update record
   */
  static async createUpdate(data: CreateUpdateData) {
    // Create a batch for this single update
    const batch = await prisma.updateBatch.create({
      data: {
        name: `${data.updateType} - ${new Date().toISOString()}`,
        description: `Admin update from ${data.source}`,
        batchType: 'MANUAL',
        status: 'PENDING',
        totalUpdates: 1,
        createdBy: data.source
      }
    })

    // Create the update record
    return await prisma.updateRecord.create({
      data: {
        batchId: batch.id,
        cardId: data.cardId,
        updateType: data.updateType,
        newData: data.updateData,
        status: 'PENDING'
      }
    })
  }

  /**
   * Process a pending update
   */
  static async processUpdate(updateId: string) {
    const update = await prisma.updateRecord.findUnique({
      where: { id: updateId }
    })

    if (!update) {
      throw new Error('Update record not found')
    }

    // Skip if already processed
    if (update.status !== 'PENDING') {
      return update
    }

    try {
      // Check if card exists
      const card = await prisma.card.findUnique({
        where: { id: update.cardId }
      })

      if (!card) {
        return await prisma.updateRecord.update({
          where: { id: updateId },
          data: {
            status: 'FAILED',
            error: `Card not found: ${update.cardId}`,
            appliedAt: new Date()
          }
        })
      }

      // Validate update data
      if (!update.newData || typeof update.newData !== 'object') {
        return await prisma.updateRecord.update({
          where: { id: updateId },
          data: {
            status: 'FAILED',
            error: 'Invalid update data',
            appliedAt: new Date()
          }
        })
      }

      // Process based on update type
      switch (update.updateType) {
        case 'CARD_UPDATE':
        case 'CARD_INFO':
          await prisma.card.update({
            where: { id: update.cardId },
            data: update.newData as any
          })
          break

        case 'BONUS':
        case 'BONUS_UPDATE':
          const bonusData = update.newData as any
          if (bonusData && typeof bonusData === 'object' && bonusData.bonusId) {
            const { bonusId, ...updateFields } = bonusData
            await prisma.cardBonus.update({
              where: { id: bonusId },
              data: updateFields as any
            })
          }
          break

        case 'MULTIPLIER':
        case 'MULTIPLIER_UPDATE':
          const multiplierData = update.newData as any
          if (multiplierData && typeof multiplierData === 'object' && multiplierData.multiplierId) {
            const { multiplierId, ...updateFields } = multiplierData
            await prisma.cardMultiplier.update({
              where: { id: multiplierId },
              data: updateFields as any
            })
          }
          break
      }

      // Mark as completed
      const completed = await prisma.updateRecord.update({
        where: { id: updateId },
        data: {
          status: 'APPLIED',
          appliedAt: new Date()
        }
      })

      // Update batch statistics
      await prisma.updateBatch.update({
        where: { id: update.batchId },
        data: {
          successfulUpdates: { increment: 1 },
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })

      return completed

    } catch (error) {
      // Mark as failed
      const failed = await prisma.updateRecord.update({
        where: { id: updateId },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          appliedAt: new Date()
        }
      })

      // Update batch statistics
      await prisma.updateBatch.update({
        where: { id: update.batchId },
        data: {
          failedUpdates: { increment: 1 }
        }
      })

      return failed
    }
  }

  /**
   * Get pending updates
   */
  static async getPendingUpdates(limit: number = 100) {
    return await prisma.updateRecord.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: limit
    })
  }

  /**
   * Get update history for a card
   */
  static async getUpdateHistory(cardId: string, limit: number = 50) {
    return await prisma.updateRecord.findMany({
      where: { cardId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  /**
   * Get update statistics
   */
  static async getUpdateStatistics() {
    const [total, pending, applied, failed] = await Promise.all([
      prisma.updateRecord.count(),
      prisma.updateRecord.count({ where: { status: 'PENDING' } }),
      prisma.updateRecord.count({ where: { status: 'APPLIED' } }),
      prisma.updateRecord.count({ where: { status: 'FAILED' } })
    ])

    const processed = applied + failed
    const successRate = processed > 0 ? Math.round((applied / processed) * 100) : 0

    return {
      total,
      pending,
      completed: applied,
      failed,
      successRate
    }
  }

  /**
   * Process pending updates in batch
   */
  static async processPendingUpdates() {
    const pendingUpdates = await this.getPendingUpdates()
    
    let successful = 0
    let failed = 0

    for (const update of pendingUpdates) {
      try {
        const result = await this.processUpdate(update.id)
        if (result.status === 'APPLIED') {
          successful++
        } else {
          failed++
        }
      } catch (error) {
        failed++
      }
    }

    return {
      processed: pendingUpdates.length,
      successful,
      failed
    }
  }

  /**
   * Compare parsed cards with database and return diffs
   */
  static async diffWithDatabase(parsedCards: ParsedCard[], source: string): Promise<CardDiff[]> {
    const diffs: CardDiff[] = []

    const dbCards = await prisma.card.findMany({
      where: { isActive: true },
      include: {
        bonuses: { where: { isActive: true } },
        multipliers: { where: { isActive: true } },
      },
    })

    for (const parsed of parsedCards) {
      // Fuzzy match: try exact normalized match first, then contains match
      const normalizedParsed = this.normalizeName(parsed.name)
      let dbCard = dbCards.find(c => this.normalizeName(c.name) === normalizedParsed)
      
      // Fallback: check if DB card name contains parsed name or vice versa
      if (!dbCard) {
        dbCard = dbCards.find(c => {
          const dbNorm = this.normalizeName(c.name)
          return dbNorm.includes(normalizedParsed) || normalizedParsed.includes(dbNorm)
        })
      }

      if (!dbCard) {
        // New card found — flag it (will be created as pending update too)
        diffs.push({
          cardId: 'NEW',
          cardName: parsed.name,
          changes: [{ field: 'status', oldValue: 'not_in_db', newValue: 'new_card' }],
          source,
        })
        continue
      }

      const changes: FieldChange[] = []

      // Compare annual fee (tolerance ±$1)
      const dbFee = Number(dbCard.annualFee)
      if (Math.abs(dbFee - parsed.annualFee) > 1) {
        changes.push({ field: 'annualFee', oldValue: dbFee, newValue: parsed.annualFee })
      }

      // Compare base reward rate (tolerance ±0.001)
      const dbBaseRate = Number(dbCard.baseRewardRate)
      if (Math.abs(dbBaseRate - parsed.baseRewardRate) > 0.001) {
        changes.push({ field: 'baseRewardRate', oldValue: dbBaseRate, newValue: parsed.baseRewardRate })
      }

      // Compare welcome bonus value
      const dbBonus = dbCard.bonuses[0]
      if (dbBonus) {
        const dbBonusValue = Number(dbBonus.estimatedValue || 0)
        if (parsed.welcomeBonusValue > 0 && Math.abs(dbBonusValue - parsed.welcomeBonusValue) > 10) {
          changes.push({ field: 'welcomeBonusValue', oldValue: dbBonusValue, newValue: parsed.welcomeBonusValue })
        }
      }

      // Compare multipliers
      const multiplierMap: Record<string, number> = {
        GROCERY: parsed.groceryMultiplier,
        GAS: parsed.gasMultiplier,
        DINING: parsed.diningMultiplier,
        RECURRING: parsed.billsMultiplier,
      }

      for (const [category, parsedValue] of Object.entries(multiplierMap)) {
        const dbMult = dbCard.multipliers.find(m => m.category === category)
        const dbValue = dbMult ? Number(dbMult.multiplierValue) : 0
        if (Math.abs(dbValue - parsedValue) > 0.001) {
          changes.push({ field: `${category.toLowerCase()}Multiplier`, oldValue: dbValue, newValue: parsedValue })
        }
      }

      if (changes.length > 0) {
        diffs.push({ cardId: dbCard.id, cardName: dbCard.name, changes, source })
      }
    }

    return diffs
  }

  /**
   * Create pending updates from diffs as a single batch
   */
  static async createPendingUpdatesFromDiffs(diffs: CardDiff[], source: string) {
    if (diffs.length === 0) return { batchId: null, count: 0 }

    const batch = await prisma.updateBatch.create({
      data: {
        name: `Pipeline Update - ${new Date().toISOString()}`,
        description: `Automated update from ${source}`,
        batchType: 'SCHEDULED',
        status: 'PENDING',
        totalUpdates: diffs.length,
        createdBy: `pipeline:${source}`,
      },
    })

    let count = 0
    for (const diff of diffs) {
      if (diff.cardId === 'NEW') continue // Skip new cards for now

      const oldData: Record<string, string | number> = {}
      const newData: Record<string, string | number> = {}
      for (const change of diff.changes) {
        oldData[change.field] = change.oldValue
        newData[change.field] = change.newValue
      }

      await prisma.updateRecord.create({
        data: {
          batchId: batch.id,
          cardId: diff.cardId,
          updateType: 'CARD_UPDATE',
          oldData,
          newData,
          changeReason: `Automated diff from ${source}`,
          status: 'PENDING',
        },
      })
      count++
    }

    return { batchId: batch.id, count }
  }

  /**
   * Reject a pending update
   */
  static async rejectUpdate(updateId: string) {
    return await prisma.updateRecord.update({
      where: { id: updateId },
      data: {
        status: 'FAILED',
        error: 'Rejected by admin',
        appliedAt: new Date(),
      },
    })
  }

  /**
   * Get pending updates with card details for admin UI
   */
  static async getPendingUpdatesWithDetails() {
    return await prisma.updateRecord.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        card: { select: { name: true, bank: true } },
        batch: { select: { name: true, description: true, createdBy: true } },
      },
    })
  }

  /**
   * Normalize card name for fuzzy matching
   */
  private static normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[®™*©◊]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Clean up old pending updates before a new pipeline run
   */
  static async cleanupOldPendingUpdates() {
    const deleted = await prisma.updateRecord.deleteMany({
      where: { status: 'PENDING' },
    })
    if (deleted.count > 0) {
      console.log(`[CardDataUpdateService] Cleaned up ${deleted.count} old pending updates`)
      // Also clean empty pending batches
      await prisma.updateBatch.deleteMany({
        where: {
          status: 'PENDING',
          totalUpdates: { gt: 0 },
          successfulUpdates: 0,
          failedUpdates: 0,
        },
      })
    }
  }
}