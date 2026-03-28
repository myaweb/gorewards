import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from '@react-email/components'

interface CategoryOptimization {
  category: string
  recommendedCard: string
  bank: string
  multiplier: number
  monthlySpending: number
  monthlyRewards: number // in cents
  yearlyRewards: number // in cents
  explanation: string
}

interface OptimizationReportEmailProps {
  userName: string
  userEmail: string
  optimizations: CategoryOptimization[]
  totalMonthlyRewards: number // in cents
  totalYearlyRewards: number // in cents
  bestOverallCard: string | null
  dashboardUrl: string
  optimizationUrl: string
}

const CATEGORY_LABELS: Record<string, string> = {
  GROCERY: 'Grocery',
  GAS: 'Gas',
  DINING: 'Dining',
  RECURRING: 'Recurring Bills',
  TRAVEL: 'Travel',
  SHOPPING: 'Shopping',
  ENTERTAINMENT: 'Entertainment',
  UTILITIES: 'Utilities',
  OTHER: 'Other',
}

const CATEGORY_ICONS: Record<string, string> = {
  GROCERY: 'https://cdn.jsdelivr.net/npm/lucide-static@0.577.0/icons/shopping-cart.svg',
  GAS: 'https://cdn.jsdelivr.net/npm/lucide-static@0.577.0/icons/fuel.svg',
  DINING: 'https://cdn.jsdelivr.net/npm/lucide-static@0.577.0/icons/utensils.svg',
  RECURRING: 'https://cdn.jsdelivr.net/npm/lucide-static@0.577.0/icons/smartphone.svg',
  TRAVEL: 'https://cdn.jsdelivr.net/npm/lucide-static@0.577.0/icons/plane.svg',
  SHOPPING: 'https://cdn.jsdelivr.net/npm/lucide-static@0.577.0/icons/shopping-bag.svg',
  ENTERTAINMENT: 'https://cdn.jsdelivr.net/npm/lucide-static@0.577.0/icons/tv.svg',
  UTILITIES: 'https://cdn.jsdelivr.net/npm/lucide-static@0.577.0/icons/zap.svg',
  OTHER: 'https://cdn.jsdelivr.net/npm/lucide-static@0.577.0/icons/circle-dot.svg',
}

export default function OptimizationReportEmail({
  userName = 'there',
  userEmail = '',
  optimizations = [],
  totalMonthlyRewards = 0,
  totalYearlyRewards = 0,
  bestOverallCard = null,
  dashboardUrl = 'https://creditrich.net/users',
  optimizationUrl = 'https://creditrich.net/users/optimization',
}: OptimizationReportEmailProps) {
  const monthlyDollars = (totalMonthlyRewards / 100).toFixed(2)
  const yearlyDollars = (totalYearlyRewards / 100).toFixed(2)

  return (
    <Html>
      <Head />
      <Preview>Your Monthly Card Optimization Report — ${monthlyDollars} in rewards this month</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>
              <Img src="https://cdn.jsdelivr.net/npm/lucide-static@0.577.0/icons/bar-chart-2.svg" width="32" height="32" alt="" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '10px', filter: 'invert(1)' }} />
              Your Optimization Report
            </Heading>
            <Text style={tagline}>Here's how to maximize your rewards this month</Text>
          </Section>

          {/* Summary */}
          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>
            <Text style={paragraph}>
              Based on your spending profile and card portfolio, here's your personalized optimization report.
              Use the right card for each category and you could earn up to{' '}
              <strong style={highlight}>${monthlyDollars}/month</strong> in rewards — that's{' '}
              <strong style={highlight}>${yearlyDollars}/year</strong>.
            </Text>

            {/* Summary Stats */}
            <Section style={statsRow}>
              <Row>
                <Column style={statBox}>
                  <Text style={statValue}>${monthlyDollars}</Text>
                  <Text style={statLabel}>Monthly Rewards</Text>
                </Column>
                <Column style={statBox}>
                  <Text style={statValue}>${yearlyDollars}</Text>
                  <Text style={statLabel}>Yearly Rewards</Text>
                </Column>
                <Column style={statBox}>
                  <Text style={statValue}>{optimizations.length}</Text>
                  <Text style={statLabel}>Categories</Text>
                </Column>
              </Row>
            </Section>

            {bestOverallCard && (
              <Section style={bestCardSection}>
                <Text style={bestCardLabel}>
                  <Img src="https://cdn.jsdelivr.net/npm/lucide-static@0.577.0/icons/star.svg" width="14" height="14" alt="" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px', filter: 'invert(1) sepia(1) saturate(3) hue-rotate(150deg)' }} />
                  Best Overall Card
                </Text>
                <Text style={bestCardName}>{bestOverallCard}</Text>
                <Text style={bestCardDesc}>This card wins the most categories for your spending profile</Text>
              </Section>
            )}

            <Hr style={divider} />

            {/* Category Breakdown */}
            <Heading style={sectionHeading}>Category Breakdown</Heading>
            <Text style={sectionSubheading}>Use these cards to maximize rewards in each category:</Text>

            {optimizations.map((opt, i) => (
              <Section key={i} style={categoryCard}>
                <Row>
                  <Column style={categoryLeft}>
                    <Text style={categoryName}>
                      {CATEGORY_ICONS[opt.category] && (
                        <Img src={CATEGORY_ICONS[opt.category]} width="16" height="16" alt="" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px', filter: 'invert(1)' }} />
                      )}
                      {CATEGORY_LABELS[opt.category] || opt.category}
                    </Text>
                    <Text style={categorySpend}>
                      ${opt.monthlySpending.toLocaleString()}/month
                    </Text>
                  </Column>
                  <Column style={categoryRight}>
                    <Text style={categoryCard_name}>{opt.recommendedCard}</Text>
                    <Text style={categoryBank}>{opt.bank}</Text>
                    <Text style={categoryReward}>
                      +${(opt.monthlyRewards / 100).toFixed(2)}/mo
                    </Text>
                  </Column>
                </Row>
                <Text style={categoryExplanation}>{opt.explanation}</Text>
              </Section>
            ))}

            <Hr style={divider} />

            {/* CTA */}
            <Section style={ctaSection}>
              <Text style={ctaText}>
                Ready to track your progress and get monthly reminders?
              </Text>
              <Section style={buttonRow}>
                <Button style={primaryButton} href={optimizationUrl}>
                  View Full Optimization
                </Button>
              </Section>
              <Section style={buttonRow}>
                <Button style={secondaryButton} href={dashboardUrl}>
                  Go to Dashboard
                </Button>
              </Section>
            </Section>

            <Hr style={divider} />

            <Text style={disclaimer}>
              This report is based on your saved spending profile and card portfolio. 
              Reward values are estimates based on current card data. 
              Not financial advice.
            </Text>

            <Text style={signature}>
              The CreditRich Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              CreditRich — Free credit card optimization for Canadians
            </Text>
            {userEmail && (
              <Text style={footerText}>Sent to {userEmail}</Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#090A0F',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}
const container = { margin: '0 auto', padding: '20px 0', maxWidth: '600px' }
const header = {
  background: 'linear-gradient(135deg, #00FFFF 0%, #00CED1 100%)',
  padding: '40px 30px',
  borderRadius: '12px 12px 0 0',
  textAlign: 'center' as const,
}
const h1 = { color: '#090A0F', fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }
const tagline = { color: '#090A0F', fontSize: '15px', fontWeight: '500', margin: '0', opacity: 0.8 }
const content = {
  backgroundColor: '#0F1117',
  padding: '40px 30px',
  borderRadius: '0 0 12px 12px',
  border: '1px solid rgba(0, 255, 255, 0.1)',
}
const greeting = { color: '#FFFFFF', fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }
const paragraph = { color: '#A0AEC0', fontSize: '15px', lineHeight: '1.6', margin: '0 0 20px 0' }
const highlight = { color: '#00FFFF', fontWeight: '700' }
const statsRow = { margin: '24px 0' }
const statBox = {
  backgroundColor: 'rgba(0, 255, 255, 0.05)',
  border: '1px solid rgba(0, 255, 255, 0.15)',
  borderRadius: '8px',
  padding: '16px',
  textAlign: 'center' as const,
  margin: '0 4px',
}
const statValue = { color: '#00FFFF', fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }
const statLabel = { color: '#6B7280', fontSize: '12px', margin: '0' }
const bestCardSection = {
  backgroundColor: 'rgba(0, 255, 255, 0.08)',
  border: '1px solid rgba(0, 255, 255, 0.2)',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '20px 0',
  textAlign: 'center' as const,
}
const bestCardLabel = { color: '#00FFFF', fontSize: '12px', fontWeight: '600', margin: '0 0 4px 0', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }
const bestCardName = { color: '#FFFFFF', fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }
const bestCardDesc = { color: '#6B7280', fontSize: '13px', margin: '0' }
const divider = { borderColor: 'rgba(255, 255, 255, 0.08)', margin: '28px 0' }
const sectionHeading = { color: '#FFFFFF', fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }
const sectionSubheading = { color: '#6B7280', fontSize: '13px', margin: '0 0 16px 0' }
const categoryCard = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 10px 0',
}
const categoryLeft = { width: '50%', verticalAlign: 'top' as const }
const categoryRight = { width: '50%', verticalAlign: 'top' as const, textAlign: 'right' as const }
const categoryName = { color: '#FFFFFF', fontSize: '14px', fontWeight: '600', margin: '0 0 2px 0' }
const categorySpend = { color: '#6B7280', fontSize: '12px', margin: '0' }
const categoryCard_name = { color: '#00FFFF', fontSize: '13px', fontWeight: '600', margin: '0 0 2px 0' }
const categoryBank = { color: '#6B7280', fontSize: '11px', margin: '0 0 4px 0' }
const categoryReward = { color: '#10B981', fontSize: '14px', fontWeight: '700', margin: '0' }
const categoryExplanation = { color: '#9CA3AF', fontSize: '12px', lineHeight: '1.5', margin: '8px 0 0 0', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }
const ctaText = { color: '#A0AEC0', fontSize: '15px', margin: '0 0 20px 0' }
const buttonRow = { textAlign: 'center' as const, margin: '0 0 10px 0' }
const primaryButton = {
  backgroundColor: '#00FFFF',
  borderRadius: '8px',
  color: '#090A0F',
  fontSize: '15px',
  fontWeight: '700',
  textDecoration: 'none',
  display: 'inline-block',
  padding: '12px 32px',
}
const secondaryButton = {
  backgroundColor: 'transparent',
  borderRadius: '8px',
  color: '#00FFFF',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
  padding: '10px 28px',
  border: '1px solid rgba(0, 255, 255, 0.3)',
}
const disclaimer = { color: '#4B5563', fontSize: '11px', lineHeight: '1.5', margin: '0 0 16px 0' }
const signature = { color: '#FFFFFF', fontSize: '15px', margin: '16px 0 0 0' }
const footer = { padding: '20px 30px', textAlign: 'center' as const }
const footerText = { color: '#4B5563', fontSize: '11px', lineHeight: '1.5', margin: '0 0 4px 0' }
