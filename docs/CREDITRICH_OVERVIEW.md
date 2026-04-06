# GoRewards — Product Overview

---

## What Is GoRewards?

GoRewards is a free, AI-powered credit card rewards optimizer built specifically for Canadians.

Most people leave hundreds — sometimes thousands — of dollars in rewards on the table every year simply because they're using the wrong card for the wrong purchase. GoRewards fixes that. You tell it how you spend your money, you tell it what you want to earn, and it builds you a personalized strategy to get there as fast as possible.

No paywalls. No subscriptions. Free for everyone.

---

## The Problem It Solves

There are 38+ Canadian credit cards on the market. Each one has different earning rates for groceries, gas, dining, travel, and bills. Each one has a different welcome bonus, annual fee, and point program. Figuring out which combination is best for your specific spending is genuinely hard.

Generic "best card" lists don't help — they're not built around your life. GoRewards is.

---

## How It Works (The Core Flow)

1. You enter your monthly spending across categories: groceries, gas, dining, bills, travel, shopping
2. You pick a goal — for example, "I want to earn 50,000 Aeroplan points for a flight"
3. GoRewards's recommendation engine analyzes every card in its database against your profile
4. It generates a personalized roadmap: which card to apply for, when, and why
5. You see exactly how many months it will take to reach your goal
6. You apply directly through the app and start earning

That's it. No spreadsheets. No guesswork.

---

## Key Features

### Personalized Recommendations
The recommendation engine scores every card based on your actual spending. It factors in:
- Welcome bonus value and whether you can realistically hit the spend requirement
- Earning rates per category (some cards give 5x on groceries, others give 1x)
- Spending caps (some bonuses max out at a certain amount per month)
- Approval probability based on your credit profile
- First-year value vs. long-term value

You get a ranked list of the top cards for your situation, with a full breakdown of why each one made the cut.

### Goal-Aware Roadmap
This is the standout feature. Instead of just recommending a card, GoRewards builds a month-by-month strategy to reach a specific goal — a flight, a hotel stay, cashback target, whatever you're working toward.

It calculates the fastest path: which card gets you there first, how the welcome bonus accelerates your timeline, and what your monthly earning rate looks like after the bonus is done.

### Card Portfolio Tracker
Once you're signed in, you can add the cards you already own. GoRewards tracks:
- Welcome bonus progress (how close you are to hitting the spend requirement)
- Annual fee renewal dates (so you're never caught off guard)
- Which cards you're actively using vs. sitting dormant

### Spending Optimization
A dedicated page shows you, category by category, which card in your wallet earns the most rewards. Groceries? Use this card. Gas? Use that one. It turns your existing cards into a smarter system without applying for anything new.

### Card Comparisons with AI
Any two cards can be compared side by side. GoRewards uses Google Gemini to generate a clear, human-readable verdict — not just a table of numbers, but an actual recommendation based on the tradeoffs.

### Card Database
Browse all 38+ Canadian credit cards with filters by network (Visa, Mastercard, Amex), annual fee tier, and rewards program. Each card has a full detail page with earning rates, welcome bonus, and a direct application link.

### Bank Connection (Beta)
Plaid integration is in beta — this will eventually allow GoRewards to read your actual transaction history and automatically categorize your spending, making recommendations even more accurate without manual input.

### Saved Strategies
Signed-in users can save any roadmap they generate. Strategies are tracked in a Kanban-style board: To Do, In Progress, Completed. You can run multiple strategies at once and mark them off as you hit your goals.

### Email Reports
You can send yourself a full optimization report by email — a summary of which cards to use for which categories, useful for reference when you're out shopping.

---

## Supported Point Programs

GoRewards covers all major Canadian rewards programs:

- Aeroplan (Air Canada)
- Membership Rewards (American Express)
- Avion (RBC)
- Scene+ (Scotiabank)
- Air Miles
- Aventura (CIBC)
- Marriott Bonvoy
- Hilton Honors
- Cashback

Each program has its own point valuation built into the engine, so comparisons are always apples-to-apples in real dollar terms.

---

## Supported Banks & Issuers

TD, RBC, CIBC, Scotiabank, BMO, American Express, National Bank, Tangerine, and more.

---

## Pricing

Everything is free. Always.

GoRewards earns a small affiliate commission when users apply for a card through the app. That's the business model — no subscriptions, no premium tiers, no locked features.

Users who want to support the project can make an optional donation ($5, $15, or $50 CAD), but it's never required to access anything.

---

## Who It's For

- Canadians who travel and want to maximize points for flights or hotels
- People who want to earn more cashback without thinking about it
- Anyone who has multiple cards and isn't sure which one to use where
- People who are new to credit card rewards and want a clear starting point
- Anyone who's been meaning to "figure out their points situation" but hasn't had the time

---

## Tech Stack (For the Curious)

Built on Next.js 14 with a PostgreSQL database, Prisma ORM, and deployed on Vercel. Authentication via Clerk. Payments via Stripe. AI comparisons via Google Gemini. Analytics via PostHog. Bank connections via Plaid.

The recommendation engine is custom-built — not a third-party service — and runs entirely server-side.

---

## The Bottom Line

GoRewards takes something that used to require a spreadsheet, a Reddit deep-dive, and a lot of patience, and turns it into a two-minute process. You put in your spending, you get a strategy, you start earning more. That's the whole pitch.

Free. Canadian. Actually useful.

**gorewards.ca**
