import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ConditionalShell } from "@/components/conditional-shell";
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { PostHogProvider } from './providers';
import { Suspense } from 'react';
import { PostHogPageView } from './posthog-pageview';

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#06b6d4",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://creditrich.net"),
  title: "CreditRich - Credit Card Rewards Optimizer",
  description: "Optimize your credit card rewards and maximize points with AI-powered intelligent financial planning. Compare 50+ Canadian credit cards.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CreditRich",
  },
  openGraph: {
    title: "CreditRich - Maximize Your Credit Card Rewards",
    description: "AI-powered credit card optimization. Get personalized strategies to reach your goals faster.",
    url: "https://creditrich.net",
    siteName: "CreditRich",
    images: [
      {
        url: "/api/og?title=Maximize Your Credit Card Rewards&subtitle=AI-Powered Optimization",
        width: 1200,
        height: 630,
        alt: "CreditRich - Credit Card Rewards Optimizer",
      },
    ],
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CreditRich - Maximize Your Credit Card Rewards",
    description: "AI-powered credit card optimization. Get personalized strategies to reach your goals faster.",
    images: ["/api/og?title=Maximize Your Credit Card Rewards&subtitle=AI-Powered Optimization"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: 'hsl(180 100% 50%)',
          colorBackground: '#090A0F',
          colorInputBackground: 'rgba(255, 255, 255, 0.05)',
          colorInputText: '#ffffff',
        },
      }}
      signUpFallbackRedirectUrl="/users"
      signInFallbackRedirectUrl="/users"
    >
      <html lang="en" className="dark">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        </head>
        <body className={GeistSans.className}>
          <PostHogProvider>
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
            <div className="relative min-h-screen">
              {/* Background gradient effects */}
              <div className="fixed inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
              </div>
              
              <ConditionalShell>
                {children}
              </ConditionalShell>
            </div>
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

