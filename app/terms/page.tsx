export const metadata = {
  title: 'Terms of Service | GoRewards',
  description: 'Terms of Service for GoRewards - Rules and guidelines for using our service.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-2 pb-16">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-12 border-b border-border/40 pb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Terms of Service</h1>
          <p className="text-muted-foreground text-sm">
            Effective Date: March 13, 2026
          </p>
          <p className="text-muted-foreground/80 mt-4 text-base leading-relaxed max-w-3xl">
            These Terms govern your use of GoRewards's credit card optimization platform. By using our Service, you agree to these Terms in full.
          </p>
        </div>

        <article className="prose prose-invert prose-cyan max-w-none">
          <h2>Agreement to Terms</h2>
          <p>
            By accessing or using GoRewards ("Service," "we," "our," or "us"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these Terms, you may not access the Service.
          </p>

          <h2>Description of Service</h2>
          <p>
            GoRewards is a credit card rewards optimization platform that provides:
          </p>
          <ul>
            <li>Data-driven credit card recommendations using deterministic algorithms</li>
            <li>Credit card comparison tools and detailed card information</li>
            <li>Rewards calculation and portfolio optimization</li>
            <li>Card portfolio tracking and management</li>
            <li>Optional bank connection for spend tracking (Premium feature via Plaid)</li>
            <li>AI-generated comparison content for card-vs-card analysis</li>
          </ul>
          <p className="text-sm text-muted-foreground/80 mt-4">
            Our recommendation engine uses mathematical calculations based on your spending patterns and current card data. AI is used selectively for content generation, not for recommendation logic.
          </p>

          <h2>User Accounts</h2>
          
          <h3>Account Creation</h3>
          <p>
            To access certain features of the Service, you must create an account through Clerk, our authentication provider. You agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and promptly update your account information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>
          <p className="text-sm text-muted-foreground/80 mt-3">
            Your authentication credentials are managed by Clerk and are not stored by GoRewards.
          </p>

          <h3>Account Termination</h3>
          <p>
            We reserve the right to suspend or terminate your account at any time for violations of these Terms or for any other reason at our sole discretion. You may delete your account at any time through your account settings.
          </p>

          <h2>Subscription and Payment Terms</h2>
          
          <div className="space-y-6 not-prose my-8">
            <div className="border border-border/40 rounded-lg p-6 bg-card/30">
              <h3 className="text-lg font-semibold mb-3 text-foreground">Premium Subscription</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Our Premium subscription is billed monthly at $9.00 CAD and includes a 7-day free trial for new subscribers.
              </p>
              <p className="text-sm text-muted-foreground/80 mb-3">By subscribing, you agree to:</p>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>7-day free trial period for first-time Premium subscribers</li>
                <li>Automatic monthly billing at $9.00 CAD after trial ends</li>
                <li>Payment processing through Stripe (we do not store your payment details)</li>
                <li>Continued billing until you cancel your subscription</li>
                <li>No refunds for partial months of service</li>
                <li>Price changes with 30 days advance notice</li>
              </ul>
            </div>

            <div className="border border-border/40 rounded-lg p-6 bg-card/30">
              <h3 className="text-lg font-semibold mb-3 text-foreground">Cancellation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You may cancel your Premium subscription at any time through the billing portal accessible from your account settings. Cancellation takes effect at the end of your current billing period. You will retain access to Premium features until the end of the paid period.
              </p>
            </div>

            <div className="border border-border/40 rounded-lg p-6 bg-card/30">
              <h3 className="text-lg font-semibold mb-3 text-foreground">Free Trial</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                First-time Premium subscribers receive a 7-day free trial. You will be charged the subscription fee ($9.00 CAD) at the end of the trial period unless you cancel before the trial ends. You can cancel at any time during the trial without being charged.
              </p>
            </div>
          </div>

          <h2>Affiliate Disclosure and Commissions</h2>
          <div className="border-l-4 border-cyan-500/50 pl-6 py-4 my-6 bg-cyan-950/20 rounded-r-lg">
            <p className="text-base leading-relaxed mb-4">
              <strong className="text-cyan-400">Important:</strong> We participate in affiliate marketing programs with credit card issuers and financial institutions. When you click on affiliate links and apply for credit cards through our Service, we may earn a commission from the issuer.
            </p>
            <p className="text-sm text-muted-foreground/80 mb-3">Key points about our affiliate relationships:</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Commissions are paid by the card issuer, not by you</li>
              <li>Applying through our links does not affect your approval odds or card terms</li>
              <li>Our recommendations are based on deterministic algorithms analyzing your spending patterns and card data, not commission rates</li>
              <li>We clearly mark affiliate links where applicable</li>
              <li>We comply with FTC guidelines for affiliate disclosure</li>
            </ul>
          </div>

          <h2>Not Financial Advice</h2>
          <div className="border-l-4 border-amber-500/50 pl-6 py-4 my-6 bg-amber-950/20 rounded-r-lg">
            <p className="text-base leading-relaxed mb-4">
              <strong className="text-amber-400">Disclaimer:</strong> The information provided through our Service is for informational purposes only and should not be considered financial advice. We are not financial advisors, and our recommendations are based on algorithmic analysis of publicly available credit card data.
            </p>
            <p className="text-sm text-muted-foreground/80 mb-3">You should:</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Conduct your own research before applying for any credit card</li>
              <li>Review current terms and conditions on the issuer's official website</li>
              <li>Consult with a qualified financial advisor for personalized advice</li>
              <li>Understand that credit card terms, fees, and bonuses can change without notice</li>
              <li>Consider your personal financial situation and credit goals</li>
            </ul>
          </div>

          <h2>Data Accuracy</h2>
          <p>
            While we strive to provide accurate and up-to-date information about credit cards, rewards programs, and bonuses:
          </p>
          <ul>
            <li>Card terms, fees, and bonuses are subject to change by issuers without notice</li>
            <li>We are not responsible for inaccuracies in third-party data sources</li>
            <li>You should verify all information on the issuer's official website before applying</li>
            <li>Reward calculations are estimates based on the spending data you provide</li>
            <li>Actual rewards earned may vary based on issuer terms and transaction categorization</li>
          </ul>
          <p className="text-sm text-muted-foreground/80 mt-4">
            We update card data regularly, but cannot guarantee real-time accuracy for all card offers and terms.
          </p>

          <h2>Plaid Integration (Premium Feature)</h2>
          <div className="border border-border/40 rounded-lg p-6 bg-card/30 my-6">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Premium users may optionally connect their bank accounts through Plaid to enable spend tracking. This feature is entirely optional and can be used to automatically categorize your transactions for more accurate recommendations.
            </p>
            <p className="text-sm text-muted-foreground/80 mb-3">By connecting your bank account, you agree to:</p>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Plaid's Terms of Service and Privacy Policy</li>
              <li>Allow us to access transaction data for spend categorization and tracking</li>
              <li>Understand that bank connection can be revoked at any time through your account settings</li>
              <li>Accept that we are not responsible for Plaid service interruptions or connection issues</li>
            </ul>
            <p className="text-sm text-muted-foreground/70 mt-4">
              Important: Your bank login credentials are handled exclusively by Plaid and are never accessible to GoRewards. We receive only aggregated transaction information necessary for spend analysis.
            </p>
          </div>

          <h2>Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by GoRewards and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of the Service without our express written permission.
          </p>

          <h2>User Content and Data</h2>
          <p>
            By using the Service, you may provide information about your spending patterns, card preferences, and financial goals. You retain ownership of this data, but grant us a license to use it to provide and improve the Service.
          </p>
          <p className="text-sm text-muted-foreground/80 mt-3">
            We use your spending data exclusively to calculate personalized recommendations and optimize your card portfolio. We do not sell your personal data to third parties.
          </p>

          <h2>Prohibited Uses</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any illegal purpose or in violation of any laws</li>
            <li>Attempt to gain unauthorized access to the Service or related systems</li>
            <li>Interfere with, disrupt, or create an undue burden on the Service</li>
            <li>Scrape, harvest, or collect data from the Service using automated means</li>
            <li>Impersonate another user, person, or entity</li>
            <li>Upload malicious code, viruses, or harmful software</li>
            <li>Violate any applicable laws, regulations, or third-party rights</li>
            <li>Use the Service to transmit spam or unsolicited communications</li>
            <li>Circumvent any security features or access controls</li>
          </ul>

          <h2>Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, GoRewards shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses resulting from:
          </p>
          <ul>
            <li>Your use or inability to use the Service</li>
            <li>Unauthorized access to or alteration of your data</li>
            <li>Errors, inaccuracies, or omissions in the Service or card data</li>
            <li>Third-party conduct, content, or services</li>
            <li>Financial decisions made based on our recommendations or information</li>
            <li>Service interruptions, downtime, or technical issues</li>
          </ul>
          <p className="text-sm text-muted-foreground/80 mt-4">
            Our total liability to you for any claims arising from your use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
          </p>

          <h2>Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless GoRewards and its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising from:
          </p>
          <ul>
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any third-party rights</li>
            <li>Any content or data you submit through the Service</li>
          </ul>

          <h2>Dispute Resolution</h2>
          <p>
            Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the Canadian Arbitration Association, except where prohibited by law. You agree to waive any right to a jury trial or to participate in a class action lawsuit.
          </p>
          <p className="text-sm text-muted-foreground/80 mt-3">
            Before initiating arbitration, you agree to first contact us to attempt to resolve the dispute informally.
          </p>

          <h2>Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of Canada, without regard to its conflict of law provisions. Any legal action or proceeding related to these Terms shall be brought exclusively in the courts of Canada.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of material changes by email or through a prominent notice on the Service at least 30 days before the changes take effect. Your continued use of the Service after changes constitutes acceptance of the new Terms.
          </p>
          <p className="text-sm text-muted-foreground/80 mt-3">
            If you do not agree to the modified Terms, you must stop using the Service and may cancel your account.
          </p>

          <h2>Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid by a court of competent jurisdiction, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
          </p>

          <h2>Entire Agreement</h2>
          <p>
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and GoRewards regarding the Service and supersede all prior agreements and understandings.
          </p>

          <h2>Contact Information</h2>
          <p>If you have any questions about these Terms, please contact us:</p>
          <ul>
            <li>Email: <a href="mailto:legal@GoRewards.com" className="text-cyan-400 hover:text-cyan-300">legal@GoRewards.com</a></li>
          </ul>

          <div className="mt-12 pt-8 border-t border-border/40">
            <p className="text-sm text-muted-foreground/70">
              These Terms of Service were last updated on March 13, 2026. By using GoRewards, you acknowledge that you have read, understood, and agree to be bound by these Terms.
            </p>
          </div>
        </article>
      </div>
    </div>
  )
}


