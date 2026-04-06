export const metadata = {
  title: 'Privacy Policy | GoRewards',
  description: 'Privacy Policy for GoRewards - How we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-2 pb-16">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-12 border-b border-border/40 pb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">
            Effective Date: March 13, 2026
          </p>
          <p className="text-muted-foreground/80 mt-4 text-base leading-relaxed max-w-3xl">
            GoRewards is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information when you use our credit card optimization platform.
          </p>
        </div>

        <article className="prose prose-invert prose-cyan max-w-none">
          <h2>Introduction</h2>
          <p>
            This Privacy Policy describes how GoRewards ("we," "our," or "us") handles your personal information when you use our website and services. We prioritize transparency and security in all data practices.
          </p>

          <h2>Information We Collect</h2>
          
          <h3>Information You Provide</h3>
          <p>We collect information you voluntarily provide when you:</p>
          <ul>
            <li>Create an account (email address, authentication credentials)</li>
            <li>Subscribe to Premium ($9 CAD/month)</li>
            <li>Enter spending patterns for card recommendations</li>
            <li>Connect bank accounts via Plaid (Premium feature, optional)</li>
            <li>Contact support or provide feedback</li>
          </ul>

          <h3>Information We Do Not Store</h3>
          <p>For your security:</p>
          <ul>
            <li>Authentication credentials are managed by Clerk, not stored by GoRewards</li>
            <li>Payment card details are processed by Stripe, not stored by GoRewards</li>
            <li>Bank login credentials are handled by Plaid, never accessible to GoRewards</li>
          </ul>

          <h3>Usage and Analytics Data</h3>
          <p>We automatically collect:</p>
          <ul>
            <li>Device and browser information</li>
            <li>Pages visited and interaction patterns</li>
            <li>IP address and general location</li>
            <li>Referral sources</li>
          </ul>
          <p>This data helps us improve the platform and understand user behavior.</p>

          <h2>How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul>
            <li>Provide and maintain our credit card recommendation service</li>
            <li>Calculate personalized card recommendations using deterministic algorithms</li>
            <li>Process Premium subscriptions and manage billing</li>
            <li>Track spending patterns for Premium users who connect bank accounts (optional)</li>
            <li>Send service updates and respond to support requests</li>
            <li>Analyze platform usage to improve features and performance</li>
            <li>Detect and prevent fraud or security issues</li>
          </ul>
          <p className="text-sm text-muted-foreground/80 mt-4">
            Note: Our recommendation engine uses mathematical calculations based on your spending inputs and current card data. We do not use AI for generating recommendations.
          </p>

          <h2>Third-Party Services</h2>
          <p className="text-base leading-relaxed mb-6">
            We partner with trusted third-party services to handle sensitive operations. These providers have their own privacy policies and security practices.
          </p>
          
          <div className="space-y-6 not-prose">
            <div className="border border-border/40 rounded-lg p-5 bg-card/30">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Clerk — Authentication</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Handles user authentication and account management. Your login credentials and email are processed by Clerk's secure infrastructure. GoRewards does not store passwords or authentication tokens.
              </p>
            </div>

            <div className="border border-border/40 rounded-lg p-5 bg-card/30">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Stripe — Payment Processing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Processes all Premium subscription payments. Your payment card details are handled exclusively by Stripe's PCI-compliant systems. GoRewards never stores complete credit card information.
              </p>
            </div>

            <div className="border border-border/40 rounded-lg p-5 bg-card/30">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Plaid — Bank Connection (Premium, Optional)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Premium users may optionally connect bank accounts to enable automatic spend tracking. Plaid securely accesses your transaction data. GoRewards receives only aggregated transaction information necessary for spend categorization.
              </p>
              <p className="text-sm text-muted-foreground/80">
                Important: Your bank login credentials are handled exclusively by Plaid and are never accessible to GoRewards. You can revoke bank access at any time.
              </p>
            </div>

            <div className="border border-border/40 rounded-lg p-5 bg-card/30">
              <h3 className="text-lg font-semibold mb-2 text-foreground">PostHog — Analytics</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Collects anonymized usage data to help us understand how users interact with the platform and identify areas for improvement.
              </p>
            </div>

            <div className="border border-border/40 rounded-lg p-5 bg-card/30">
              <h3 className="text-lg font-semibold mb-2 text-foreground">OpenAI ChatGPT — AI Content Generation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Used exclusively to generate comparison verdicts for card-vs-card comparison pages. Card specifications and bonus details are sent to OpenAI's ChatGPT API for content generation. This AI service is not used for recommendation calculations.
              </p>
            </div>
          </div>

          <h2 className="mt-12">Affiliate Disclosure</h2>
          <p>
            GoRewards participates in affiliate marketing programs with credit card issuers. When you apply for a card through our affiliate links, we may earn a commission from the issuer at no cost to you.
          </p>
          <p className="text-sm text-muted-foreground/80 mt-3">
            Our recommendations are generated using mathematical algorithms based on your spending patterns and current card data. Affiliate commission rates do not influence our recommendation calculations or card rankings.
          </p>

          <h2>Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your information, including:
          </p>
          <ul>
            <li>Encrypted data transmission (HTTPS/TLS)</li>
            <li>Secure authentication via Clerk</li>
            <li>PCI-compliant payment processing via Stripe</li>
            <li>Regular security audits and monitoring</li>
            <li>Access controls and data minimization practices</li>
          </ul>
          <p className="text-sm text-muted-foreground/80 mt-4">
            While we take security seriously, no internet transmission is 100% secure. We cannot guarantee absolute security but continuously work to protect your data.
          </p>

          <h2>Your Privacy Rights</h2>
          <p>Depending on your jurisdiction, you may have the following rights:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Restriction:</strong> Object to or restrict certain data processing activities</li>
            <li><strong>Portability:</strong> Request your data in a portable format</li>
            <li><strong>Withdrawal:</strong> Withdraw consent for data processing at any time</li>
          </ul>
          <p className="text-sm text-muted-foreground/80 mt-4">
            To exercise these rights, contact us at <a href="mailto:privacy@GoRewards.com" className="text-cyan-400 hover:text-cyan-300">privacy@GoRewards.com</a>. We will respond within 30 days.
          </p>

          <h2>Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to maintain sessions, remember preferences, and analyze platform usage. You can control cookie settings through your browser, though some features may not function properly if cookies are disabled.
          </p>
          <p className="text-sm text-muted-foreground/80 mt-3">
            Our analytics provider (PostHog) uses cookies to track anonymized usage patterns.
          </p>

          <h2>Children's Privacy</h2>
          <p>
            GoRewards is not intended for individuals under 18. We do not knowingly collect information from children. If you believe a child has provided us with personal information, please contact us immediately.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. Material changes will be communicated via email or prominent notice on the platform. The "Effective Date" at the top indicates the most recent update.
          </p>

          <h2>Contact Us</h2>
          <p>For privacy-related questions or to exercise your rights, contact us at:</p>
          <ul>
            <li>Email: <a href="mailto:privacy@GoRewards.com" className="text-cyan-400 hover:text-cyan-300">privacy@GoRewards.com</a></li>
          </ul>

          <div className="mt-12 pt-8 border-t border-border/40">
            <p className="text-sm text-muted-foreground/70">
              This Privacy Policy was last updated on March 13, 2026. By using GoRewards, you acknowledge that you have read and understood this policy.
            </p>
          </div>
        </article>
      </div>
    </div>
  )
}


