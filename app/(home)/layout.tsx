import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://GoRewards.net"

export const metadata: Metadata = {
  title: "GoRewards - AI-Powered Credit Card Rewards Optimizer for Canadians",
  description:
    "Find the best Canadian credit card for your spending. GoRewards analyzes your grocery, gas, dining, and bills to build a personalized rewards strategy. Compare 50+ cards free.",
  keywords: [
    "best Canadian credit card",
    "credit card rewards optimizer",
    "Canadian credit card comparison",
    "maximize credit card points",
    "Aeroplan card",
    "Scene+ card",
    "Membership Rewards Canada",
    "cashback credit card Canada",
    "credit card welcome bonus",
    "AI credit card recommendation",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "GoRewards - Maximize Your Credit Card Rewards",
    description:
      "AI-powered credit card optimization for Canadians. Get a personalized strategy based on your real spending.",
    url: siteUrl,
    siteName: "GoRewards",
    images: [
      {
        url: `/api/og?title=Maximize Your Credit Card Rewards&subtitle=AI-Powered Optimization for Canadians`,
        width: 1200,
        height: 630,
        alt: "GoRewards - Credit Card Rewards Optimizer",
      },
    ],
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoRewards - Maximize Your Credit Card Rewards",
    description:
      "AI-powered credit card optimization for Canadians. Get a personalized strategy based on your real spending.",
    images: [
      `/api/og?title=Maximize Your Credit Card Rewards&subtitle=AI-Powered Optimization for Canadians`,
    ],
  },
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

