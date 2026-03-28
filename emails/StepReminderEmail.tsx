import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'

interface StepReminderEmailProps {
  userName: string
  goalName: string
  nextStepMonth: number
  nextStepAction: string
  nextStepCardName: string
  totalProgress: number
  dashboardUrl: string
}

export default function StepReminderEmail({
  userName = 'Valued Member',
  goalName = 'Your Rewards Goal',
  nextStepMonth = 1,
  nextStepAction = 'Apply',
  nextStepCardName = 'Premium Card',
  totalProgress = 0,
  dashboardUrl = 'https://creditrich.net/users',
}: StepReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Time for your next rewards strategy step - {goalName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with gradient */}
          <Section style={header}>
            <Heading style={h1}>⚡ Rewards Roadmap</Heading>
            <Text style={tagline}>Your Next Step Awaits</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>
            
            <Text style={paragraph}>
              It's time for the next step in your <strong style={highlight}>{goalName}</strong> rewards strategy.
            </Text>

            {/* Action Card */}
            <Section style={actionCard}>
              <Text style={actionLabel}>MONTH {nextStepMonth}</Text>
              <Heading style={actionHeading}>
                {nextStepAction === 'APPLY' ? '📝 Apply for' : '💳 Use'}
              </Heading>
              <Text style={cardName}>{nextStepCardName}</Text>
              
              <Section style={progressSection}>
                <Text style={progressText}>Your Progress: {totalProgress}%</Text>
                <Section style={progressBarContainer}>
                  <Section style={{...progressBar, width: `${totalProgress}%`}} />
                </Section>
              </Section>
            </Section>

            <Text style={paragraph}>
              Log in to your dashboard to check off your progress and see the details of your next card application.
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                View Dashboard
              </Button>
            </Section>

            <Hr style={divider} />

            {/* Footer Tips */}
            <Section style={tipsSection}>
              <Text style={tipsHeading}>💡 Pro Tips</Text>
              <Text style={tipText}>
                • Check your credit score before applying
              </Text>
              <Text style={tipText}>
                • Set calendar reminders for minimum spend deadlines
              </Text>
              <Text style={tipText}>
                • Track your spending to maximize bonus earnings
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you saved a rewards strategy.
            </Text>
            <Text style={footerText}>
              Rewards Roadmap - Optimize Your Credit Card Strategy
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles matching #090A0F dark theme with teal accents
const main = {
  backgroundColor: '#090A0F',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
}

const header = {
  background: 'linear-gradient(135deg, #00FFFF 0%, #00CED1 100%)',
  padding: '40px 30px',
  borderRadius: '12px 12px 0 0',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#090A0F',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
}

const tagline = {
  color: '#090A0F',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
  opacity: 0.8,
}

const content = {
  backgroundColor: '#0F1117',
  padding: '40px 30px',
  borderRadius: '0 0 12px 12px',
  border: '1px solid rgba(0, 255, 255, 0.1)',
}

const greeting = {
  color: '#FFFFFF',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 20px 0',
}

const paragraph = {
  color: '#A0AEC0',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
}

const highlight = {
  color: '#00FFFF',
  fontWeight: '600',
}

const actionCard = {
  backgroundColor: 'rgba(0, 255, 255, 0.05)',
  border: '2px solid rgba(0, 255, 255, 0.2)',
  borderRadius: '12px',
  padding: '30px',
  margin: '30px 0',
  textAlign: 'center' as const,
}

const actionLabel = {
  color: '#00FFFF',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '1.5px',
  margin: '0 0 12px 0',
  textTransform: 'uppercase' as const,
}

const actionHeading = {
  color: '#FFFFFF',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 8px 0',
}

const cardName = {
  color: '#00FFFF',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 20px 0',
}

const progressSection = {
  marginTop: '20px',
}

const progressText = {
  color: '#A0AEC0',
  fontSize: '14px',
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
}

const progressBarContainer = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '999px',
  height: '8px',
  overflow: 'hidden',
  width: '100%',
}

const progressBar = {
  background: 'linear-gradient(90deg, #00FFFF 0%, #00CED1 100%)',
  height: '100%',
  borderRadius: '999px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
}

const button = {
  backgroundColor: '#00FFFF',
  borderRadius: '8px',
  color: '#090A0F',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
  boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
}

const divider = {
  borderColor: 'rgba(255, 255, 255, 0.1)',
  margin: '30px 0',
}

const tipsSection = {
  backgroundColor: 'rgba(0, 255, 255, 0.03)',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
}

const tipsHeading = {
  color: '#00FFFF',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px 0',
}

const tipText = {
  color: '#A0AEC0',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
}

const footer = {
  padding: '20px 30px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6B7280',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0 0 4px 0',
}
