/**
 * Analytics Event Type Definitions
 * 
 * Centralized type-safe event definitions for PostHog analytics
 */

export type AnalyticsEvent =
  // Recommendation & Strategy Events
  | { name: 'recommendation_completed'; properties: RecommendationCompletedProps }
  | { name: 'strategy_saved'; properties: StrategySavedProps }
  
  // Plaid & Banking Events
  | { name: 'plaid_connected'; properties: PlaidConnectedProps }
  | { name: 'card_mapping_completed'; properties: CardMappingCompletedProps }
  
  // Transaction Events
  | { name: 'category_corrected'; properties: CategoryCorrectedProps }
  
  // Premium & Subscription Events
  | { name: 'premium_trial_started'; properties: PremiumTrialStartedProps }
  | { name: 'premium_trial_converted'; properties: PremiumTrialConvertedProps }
  | { name: 'premium_subscription_cancelled'; properties: PremiumSubscriptionCancelledProps }
  | { name: 'checkout_started'; properties: CheckoutStartedProps }
  | { name: 'checkout_error'; properties: CheckoutErrorProps }
  
  // Feedback & Engagement Events
  | { name: 'beta_feedback_submitted'; properties: BetaFeedbackSubmittedProps }
  | { name: 'affiliate_link_clicked'; properties: AffiliateLinkClickedProps }

// Event Property Interfaces

export interface RecommendationCompletedProps {
  card_name: string
  card_bank: string
  net_value: number
  spending_profile: {
    grocery: number
    gas: number
    dining: number
    bills: number
  }
}

export interface StrategySavedProps {
  goal_name: string
  total_months: number
  total_points: number
  goal_achieved: boolean
}

export interface PlaidConnectedProps {
  institution_name: string
  institution_id: string
  accounts_count: number
  timestamp: string
}

export interface CardMappingCompletedProps {
  mappings_count: number
  accounts_count: number
  cards_count: number
}

export interface CategoryCorrectedProps {
  original_category: string
  corrected_category: string
  merchant: string
  confidence: number
}

export interface PremiumTrialStartedProps {
  source: string
  timestamp: string
}

export interface PremiumTrialConvertedProps {
  stripe_customer_id: string
  stripe_subscription_id: string
  plan: string
  amount: number
  currency: string
  timestamp: string
}

export interface PremiumSubscriptionCancelledProps {
  stripe_subscription_id: string
  reason?: string
  timestamp: string
}

export interface CheckoutStartedProps {
  product: string
  price: number
  currency: string
  source: string
}

export interface CheckoutErrorProps {
  error: string
  source: string
}

export interface BetaFeedbackSubmittedProps {
  feedback_length: number
  source: string
}

export interface AffiliateLinkClickedProps {
  cardName: string
  cardId: string
  cardBank: string
  position: string
  source: string
}

// Retention Metrics Types

export interface RetentionMetrics {
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  trialConversionRate: number
  premiumRetentionRate: number
  churnRate: number
  averageSessionDuration: number
}

export interface CohortData {
  cohortDate: string
  usersCount: number
  retentionDay1: number
  retentionDay7: number
  retentionDay30: number
  conversionRate: number
}

export interface FunnelStep {
  step: string
  users: number
  conversionRate: number
  dropoffRate: number
}
