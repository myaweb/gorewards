import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import StepReminderEmail from '@/emails/StepReminderEmail'

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Security: Verify cron secret
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret) {
    console.warn('CRON_SECRET not configured')
    return false
  }
  
  return authHeader === `Bearer ${cronSecret}`
}

interface RoadmapStep {
  month: number
  cardId: string
  cardName: string
  action: 'APPLY' | 'USE'
  monthlyPointsEarned: number
  cumulativePoints: number
  bonusProgress?: {
    bonusEarned: boolean
    bonusPoints: number
  } | null
}

interface RoadmapData {
  steps: RoadmapStep[]
  totalMonths: number
  totalPointsEarned: number
  goalAchieved: boolean
}

/**
 * Determine if a user needs a reminder based on their strategy
 * Logic: Send reminder if strategy is not completed and was created/updated more than 7 days ago
 */
function shouldSendReminder(strategy: any): boolean {
  if (strategy.isCompleted) {
    return false
  }

  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(strategy.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  // Send reminder if no activity for 7+ days
  return daysSinceUpdate >= 7
}

/**
 * Get the next incomplete step from the roadmap
 */
function getNextStep(roadmapData: RoadmapData): RoadmapStep | null {
  const steps = roadmapData.steps || []
  
  // For simplicity, return the first step
  // In a real implementation, you'd track which steps are completed
  return steps.length > 0 ? steps[0] : null
}

/**
 * Calculate progress percentage
 */
function calculateProgress(roadmapData: RoadmapData): number {
  const steps = roadmapData.steps || []
  if (steps.length === 0) return 0
  
  // For simplicity, assume 0% progress if not completed
  // In a real implementation, you'd track completed steps
  return 0
}

/**
 * Send reminder email to a user
 */
async function sendReminderEmail(
  userEmail: string,
  userName: string,
  strategy: any
): Promise<boolean> {
  try {
    const roadmapData = strategy.roadmapData as RoadmapData
    const nextStep = getNextStep(roadmapData)
    
    if (!nextStep) {
      console.log(`No next step found for strategy ${strategy.id}`)
      return false
    }

    const progress = calculateProgress(roadmapData)
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://GoRewards.net'}/users`

    const emailHtml = await render(
      StepReminderEmail({
        userName,
        goalName: strategy.goalName,
        nextStepMonth: nextStep.month,
        nextStepAction: nextStep.action,
        nextStepCardName: nextStep.cardName,
        totalProgress: progress,
        dashboardUrl,
      })
    )

    const result = await resend.emails.send({
      from: 'Rewards Roadmap <onboarding@resend.dev>', // Update with your verified domain
      to: userEmail,
      subject: `⚡ Time for your next step: ${strategy.goalName}`,
      html: emailHtml,
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return false
    }

    console.log(`Reminder sent to ${userEmail} for strategy ${strategy.id}`)
    return true
  } catch (error) {
    console.error('Error sending reminder email:', error)
    return false
  }
}

/**
 * Main cron job handler
 */
export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Check if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY not configured' },
      { status: 500 }
    )
  }

  const startTime = Date.now()
  const results = {
    totalStrategies: 0,
    remindersSent: 0,
    errors: 0,
  }

  try {
    // Fetch all incomplete strategies
    const strategies = await prisma.savedStrategy.findMany({
      where: {
        isCompleted: false,
      },
      include: {
        user: true,
      },
      orderBy: {
        updatedAt: 'asc',
      },
    })

    results.totalStrategies = strategies.length

    // Process each strategy
    for (const strategy of strategies) {
      try {
        // Check if reminder should be sent
        if (!shouldSendReminder(strategy)) {
          continue
        }

        // Get user name from Clerk or use email
        const userName = strategy.user.email.split('@')[0] || 'Valued Member'

        // Send reminder email
        const sent = await sendReminderEmail(
          strategy.user.email,
          userName,
          strategy
        )

        if (sent) {
          results.remindersSent++
          
          // Update strategy updatedAt to prevent duplicate reminders
          await prisma.savedStrategy.update({
            where: { id: strategy.id },
            data: { updatedAt: new Date() },
          })
        } else {
          results.errors++
        }
      } catch (error) {
        console.error(`Error processing strategy ${strategy.id}:`, error)
        results.errors++
      }
    }

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      message: 'Reminder emails processed successfully',
      results,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        results,
      },
      { status: 500 }
    )
  }
}

// Allow POST as well for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}

