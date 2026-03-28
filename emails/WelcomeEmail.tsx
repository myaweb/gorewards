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

interface WelcomeEmailProps {
  userName: string
  userEmail: string
  dashboardUrl: string
}

export default function WelcomeEmail({
  userName = 'Valued Member',
  userEmail = '',
  dashboardUrl = 'https://creditrich.net/users',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Your Rewards Roadmap - Start Optimizing Today</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with gradient */}
          <Section style={header}>
            <Heading style={h1}>🎉 Welcome to Rewards Roadmap</Heading>
            <Text style={tagline}>Your Journey to Maximum Rewards Starts Now</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>
            
            <Text style={paragraph}>
              Welcome to <strong style={highlight}>Rewards Roadmap</strong> - the smartest way to optimize your credit card rewards strategy!
            </Text>

            <Text style={paragraph}>
              We're excited to help you maximize your points and reach your travel and rewards goals faster than ever.
            </Text>

            {/* Feature Cards */}
            <Section style={featuresSection}>
              <Section style={featureCard}>
                <Text style={featureIcon}>🎯</Text>
                <Text style={featureTitle}>Smart Optimization</Text>
                <Text style={featureText}>
                  Our AI-powered engine analyzes your spending to create personalized card strategies
                </Text>
              </Section>

              <Section style={featureCard}>
                <Text style={featureIcon}>📊</Text>
                <Text style={featureTitle}>Track Progress</Text>
                <Text style={featureText}>
                  Monitor your roadmap with interactive checklists and celebrate milestones
                </Text>
              </Section>

              <Section style={featureCard}>
                <Text style={featureIcon}>💰</Text>
                <Text style={featureTitle}>Maximize Bonuses</Text>
                <Text style={featureText}>
                  Never miss a welcome bonus or category multiplier opportunity
                </Text>
              </Section>
            </Section>

            {/* Getting Started */}
            <Section style={stepsSection}>
              <Heading style={stepsHeading}>Getting Started is Easy</Heading>
              
              <Section style={stepItem}>
                <Text style={stepNumber}>1</Text>
                <Section style={stepContent}>
                  <Text style={stepTitle}>Enter Your Spending</Text>
                  <Text style={stepDescription}>
                    Tell us about your monthly spending in different categories
                  </Text>
                </Section>
              </Section>

              <Section style={stepItem}>
                <Text style={stepNumber}>2</Text>
                <Section style={stepContent}>
                  <Text style={stepTitle}>Choose Your Goal</Text>
                  <Text style={stepDescription}>
                    Select from Aeroplan, Marriott, Cashback, and more
                  </Text>
                </Section>
              </Section>

              <Section style={stepItem}>
                <Text style={stepNumber}>3</Text>
                <Section style={stepContent}>
                  <Text style={stepTitle}>Get Your Roadmap</Text>
                  <Text style={stepDescription}>
                    Receive a month-by-month strategy to reach your goal
                  </Text>
                </Section>
              </Section>

              <Section style={stepItem}>
                <Text style={stepNumber}>4</Text>
                <Section style={stepContent}>
                  <Text style={stepTitle}>Track & Achieve</Text>
                  <Text style={stepDescription}>
                    Save to dashboard and check off steps as you complete them
                  </Text>
                </Section>
              </Section>
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                Go to Dashboard
              </Button>
            </Section>

            <Hr style={divider} />

            {/* Tips */}
            <Section style={tipsSection}>
              <Text style={tipsHeading}>💡 Pro Tips for Success</Text>
              <Text style={tipText}>
                • Start with cards that match your highest spending categories
              </Text>
              <Text style={tipText}>
                • Set calendar reminders for minimum spend deadlines
              </Text>
              <Text style={tipText}>
                • Check your credit score regularly (we recommend Borrowell)
              </Text>
              <Text style={tipText}>
                • Space out applications by 3-6 months for best approval odds
              </Text>
            </Section>

            <Text style={paragraph}>
              Have questions? Just reply to this email - we're here to help!
            </Text>

            <Text style={signature}>
              Happy optimizing,<br />
              The Rewards Roadmap Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you created an account at Rewards Roadmap.
            </Text>
            <Text style={footerText}>
              {userEmail && `Sent to ${userEmail}`}
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

const featuresSection = {
  margin: '30px 0',
}

const featureCard = {
  backgroundColor: 'rgba(0, 255, 255, 0.05)',
  border: '1px solid rgba(0, 255, 255, 0.1)',
  borderRadius: '8px',
  padding: '20px',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
}

const featureIcon = {
  fontSize: '32px',
  margin: '0 0 8px 0',
}

const featureTitle = {
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px 0',
}

const featureText = {
  color: '#A0AEC0',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
}

const stepsSection = {
  margin: '30px 0',
}

const stepsHeading = {
  color: '#FFFFFF',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 20px 0',
  textAlign: 'center' as const,
}

const stepItem = {
  display: 'flex',
  alignItems: 'flex-start',
  margin: '0 0 16px 0',
}

const stepNumber = {
  backgroundColor: '#00FFFF',
  color: '#090A0F',
  fontSize: '16px',
  fontWeight: '700',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '16px',
  flexShrink: 0,
}

const stepContent = {
  flex: 1,
}

const stepTitle = {
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px 0',
}

const stepDescription = {
  color: '#A0AEC0',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
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

const signature = {
  color: '#FFFFFF',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '20px 0 0 0',
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
