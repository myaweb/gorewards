import { prisma } from '../prisma'

// Job status type
export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

// Scheduled job interface
export interface ScheduledJob {
  id: string
  name: string
  description: string | null
  cronExpression: string
  jobType: string
  parameters: Record<string, any>
  isActive: boolean
  lastRun: Date | null
  nextRun: Date | null
  status: JobStatus
  createdAt: Date
  updatedAt: Date
}

// import cron from 'node-cron'

// TODO: Install node-cron dependency when implementing scheduled jobs
// npm install node-cron @types/node-cron

/**
 * Scheduled Job Service
 * 
 * Manages scheduled jobs for automated card data updates.
 * Supports cron-based scheduling and job execution tracking.
 */
export class ScheduledJobService {
  private static activeJobs = new Map<string, any>()
  
  /**
   * Create a new scheduled job
   */
  static async createScheduledJob(
    name: string,
    description: string,
    cronExpression: string,
    jobType: string,
    parameters: Record<string, any> = {},
    createdBy?: string
  ): Promise<ScheduledJob> {
    
    // TODO: Implement cron validation when node-cron is installed
    // if (!cron.validate(cronExpression)) {
    //   throw new Error('Invalid cron expression')
    // }
    
    const job = await prisma.scheduledJob.create({
      data: {
        name,
        description,
        cronExpression,
        jobType,
        parameters,
        isActive: true,
        nextRun: this.calculateNextRun(cronExpression),
        createdBy
      }
    })
    
    // Start the job if it's active
    if (job.isActive) {
      await this.startJob(job.id)
    }
    
    return this.transformJob(job)
  }
  
  /**
   * Update scheduled job
   */
  static async updateScheduledJob(
    jobId: string,
    updates: Partial<{
      name: string
      description: string
      cronExpression: string
      parameters: Record<string, any>
      isActive: boolean
    }>
  ): Promise<ScheduledJob> {
    
    // TODO: Implement cron validation when node-cron is installed
    // if (updates.cronExpression && !cron.validate(updates.cronExpression)) {
    //   throw new Error('Invalid cron expression')
    // }
    
    // Stop existing job if it's running
    await this.stopJob(jobId)
    
    const job = await prisma.scheduledJob.update({
      where: { id: jobId },
      data: {
        ...updates,
        nextRun: updates.cronExpression ? this.calculateNextRun(updates.cronExpression) : undefined,
        updatedAt: new Date()
      }
    })
    
    // Restart job if it's active
    if (job.isActive) {
      await this.startJob(job.id)
    }
    
    return this.transformJob(job)
  }
  
  /**
   * Delete scheduled job
   */
  static async deleteScheduledJob(jobId: string): Promise<void> {
    await this.stopJob(jobId)
    await prisma.scheduledJob.delete({
      where: { id: jobId }
    })
  }
  
  /**
   * Get all scheduled jobs
   */
  static async getAllScheduledJobs(): Promise<ScheduledJob[]> {
    const jobs = await prisma.scheduledJob.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return jobs.map(this.transformJob)
  }
  
  /**
   * Get scheduled job by ID
   */
  static async getScheduledJob(jobId: string): Promise<ScheduledJob | null> {
    const job = await prisma.scheduledJob.findUnique({
      where: { id: jobId }
    })
    
    return job ? this.transformJob(job) : null
  }
  
  /**
   * Start a scheduled job
   */
  static async startJob(jobId: string): Promise<void> {
    const job = await prisma.scheduledJob.findUnique({
      where: { id: jobId }
    })
    
    if (!job || !job.isActive) {
      return
    }
    
    // Stop existing job if running
    if (this.activeJobs.has(jobId)) {
      this.activeJobs.get(jobId).destroy()
    }
    
    // TODO: Implement cron scheduling when node-cron is installed
    // Create new cron job
    // const cronJob = cron.schedule(job.cronExpression, async () => {
    //   await this.executeJob(jobId)
    // }, {
    //   scheduled: true,
    //   timezone: 'America/Toronto' // Adjust timezone as needed
    // })
    
    // this.activeJobs.set(jobId, cronJob)
    
    console.log(`Started scheduled job: ${job.name} (${job.cronExpression})`)
  }
  
  /**
   * Stop a scheduled job
   */
  static async stopJob(jobId: string): Promise<void> {
    if (this.activeJobs.has(jobId)) {
      this.activeJobs.get(jobId).destroy()
      this.activeJobs.delete(jobId)
      console.log(`Stopped scheduled job: ${jobId}`)
    }
  }
  
  /**
   * Execute a scheduled job
   */
  static async executeJob(jobId: string): Promise<void> {
    const job = await prisma.scheduledJob.findUnique({
      where: { id: jobId }
    })
    
    if (!job || !job.isActive) {
      return
    }
    
    console.log(`Executing scheduled job: ${job.name}`)
    
    // Update job status to running
    await prisma.scheduledJob.update({
      where: { id: jobId },
      data: {
        status: 'RUNNING',
        lastRun: new Date(),
        runCount: { increment: 1 }
      }
    })
    
    try {
      // Execute job based on type
      await this.executeJobByType(job.jobType, (job.parameters as Record<string, any>) || {})
      
      // Update job status to completed
      await prisma.scheduledJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          nextRun: this.calculateNextRun(job.cronExpression),
          successCount: { increment: 1 },
          lastError: null
        }
      })
      
      console.log(`Completed scheduled job: ${job.name}`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Update job status to failed
      await prisma.scheduledJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          nextRun: this.calculateNextRun(job.cronExpression),
          failureCount: { increment: 1 },
          lastError: errorMessage
        }
      })
      
      console.error(`Failed scheduled job: ${job.name}`, error)
    }
  }
  
  /**
   * Execute job based on job type
   */
  private static async executeJobByType(
    jobType: string, 
    parameters: Record<string, any>
  ): Promise<void> {
    
    switch (jobType) {
      case 'SYNC_CARD_OFFERS':
        await this.syncCardOffers(parameters)
        break
        
      case 'UPDATE_POINT_VALUES':
        await this.updatePointValues(parameters)
        break
        
      case 'EXPIRE_OLD_OFFERS':
        await this.expireOldOffers(parameters)
        break
        
      case 'CLEANUP_HISTORY':
        await this.cleanupHistory(parameters)
        break
        
      case 'HEALTH_CHECK':
        await this.performHealthCheck(parameters)
        break
        
      default:
        throw new Error(`Unknown job type: ${jobType}`)
    }
  }
  
  /**
   * Job implementations
   */
  private static async syncCardOffers(parameters: Record<string, any>): Promise<void> {
    console.log('Syncing card offers...', parameters)
    
    // Deactivate expired offers
    await prisma.cardOffer.updateMany({
      where: {
        validUntil: { lt: new Date() },
        isActive: true
      },
      data: { isActive: false }
    })
    
    // Here you would implement external API calls to fetch new offers
    // For now, we'll just log the operation
    console.log('Card offers sync completed')
  }
  
  private static async updatePointValues(parameters: Record<string, any>): Promise<void> {
    console.log('Updating point values...', parameters)
    
    // Here you would implement logic to update point valuations
    // This could involve API calls to get current redemption rates
    console.log('Point values update completed')
  }
  
  private static async expireOldOffers(parameters: Record<string, any>): Promise<void> {
    const daysOld = parameters.daysOld || 30
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    const result = await prisma.cardOffer.updateMany({
      where: {
        validUntil: { lt: cutoffDate },
        isActive: true
      },
      data: { isActive: false }
    })
    
    console.log(`Expired ${result.count} old offers`)
  }
  
  private static async cleanupHistory(parameters: Record<string, any>): Promise<void> {
    const daysOld = parameters.daysOld || 365
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    const result = await prisma.cardHistory.deleteMany({
      where: {
        createdAt: { lt: cutoffDate }
      }
    })
    
    console.log(`Cleaned up ${result.count} old history records`)
  }
  
  private static async performHealthCheck(parameters: Record<string, any>): Promise<void> {
    console.log('Performing system health check...', parameters)
    
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`
    
    // Check for stale data
    const staleOffers = await prisma.cardOffer.count({
      where: {
        validUntil: { lt: new Date() },
        isActive: true
      }
    })
    
    if (staleOffers > 0) {
      console.warn(`Found ${staleOffers} stale offers that should be expired`)
    }
    
    console.log('Health check completed')
  }
  
  /**
   * Initialize all active scheduled jobs on startup
   */
  static async initializeJobs(): Promise<void> {
    const activeJobs = await prisma.scheduledJob.findMany({
      where: { isActive: true }
    })
    
    for (const job of activeJobs) {
      await this.startJob(job.id)
    }
    
    console.log(`Initialized ${activeJobs.length} scheduled jobs`)
  }
  
  /**
   * Shutdown all scheduled jobs
   */
  static async shutdownJobs(): Promise<void> {
    for (const [jobId] of this.activeJobs) {
      await this.stopJob(jobId)
    }
    
    console.log('All scheduled jobs stopped')
  }
  
  /**
   * Helper methods
   */
  private static calculateNextRun(cronExpression: string): Date {
    // Simple next run calculation - in production you'd use a proper cron parser
    const now = new Date()
    const nextRun = new Date(now.getTime() + 60 * 60 * 1000) // Default to 1 hour from now
    return nextRun
  }
  
  private static transformJob(job: any): ScheduledJob {
    return {
      id: job.id,
      name: job.name,
      description: job.description,
      cronExpression: job.cronExpression,
      jobType: job.jobType,
      parameters: job.parameters || {},
      isActive: job.isActive,
      lastRun: job.lastRun,
      nextRun: job.nextRun,
      status: job.status as JobStatus,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    }
  }
}