# BonusGo Architecture - Transaction Intelligence Flow

Visual representation of the implemented architecture for Steps 7-9.

---

## Transaction Processing Flow (STEP 7)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BANK                              │
│                    (Connected via Plaid)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Raw Transaction Data
                             │ "WALMART SUPERCENTER #123 TORONTO"
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PLAID API INTEGRATION                         │
│                  /api/plaid/sync-transactions                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ PlaidTransaction Object
                             │ { name, merchant_name, amount, date }
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              MERCHANT NORMALIZATION SERVICE ⭐                   │
│              lib/services/merchantNormalizer.ts                  │
│                                                                  │
│  1. Normalize Name: "WALMART..." → "walmart"                    │
│  2. Lookup Category: Check MERCHANT_PATTERNS                    │
│  3. Calculate Confidence: Pattern match + keywords              │
│  4. Flag for Review: confidence < 0.7                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ NormalizedTransaction
                             │ { normalizedMerchant, category, confidence }
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              CONFIDENCE SCORING SERVICE ⭐                       │
│              lib/services/confidenceScorer.ts                    │
│                                                                  │
│  Factors (weighted):                                            │
│  • Merchant Match (40%)                                         │
│  • Amount Pattern (20%)                                         │
│  • Historical Data (30%)                                        │
│  • Category Consistency (10%)                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ TransactionConfidence
                             │ { confidence, needsReview, factors }
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE STORAGE                              │
│                    Transaction Table                             │
│                                                                  │
│  Stores:                                                        │
│  • Original merchant name                                       │
│  • Normalized merchant                                          │
│  • Category + confidence                                        │
│  • Review flag                                                  │
│  • User corrections                                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ If needsReview = true
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              USER CORRECTION FLOW (STEP 8) ⭐                    │
│              components/category-correction-modal.tsx            │
│                                                                  │
│  User sees:                                                     │
│  • Transaction details                                          │
│  • Current category + confidence                                │
│  • Dropdown to select correct category                          │
│                                                                  │
│  On submit:                                                     │
│  • Update transaction (confidence = 1.0)                        │
│  • Feed correction to ConfidenceScorer                          │
│  • Improve future accuracy                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Corrected Transaction
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REWARD ENGINE                                 │
│              lib/services/cardOptimizationEngine.ts              │
│                                                                  │
│  Receives ONLY normalized, categorized transactions             │
│  Calculates rewards based on:                                   │
│  • Card multipliers                                             │
│  • Spending category                                            │
│  • Monthly/annual caps                                          │
└─────────────────────────────────────────────────────────────────┘
```

**Key Architecture Rules Enforced:**
- ✅ Plaid → Normalization → Confidence → Reward Engine (single flow)
- ✅ Reward engine NEVER sees raw Plaid data
- ✅ User corrections feed back into learning system
- ✅ Single source of truth for merchant categories

---

## Card Mapping Flow (STEP 8)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DASHBOARD                           │
│                                                                  │
│  Shows:                                                         │
│  • Connected bank accounts (from Plaid)                         │
│  • Credit cards in portfolio                                    │
│  • "Map Accounts" button                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ User clicks "Map Accounts"
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              CARD MAPPING MODAL ⭐                               │
│              components/card-mapping-modal.tsx                   │
│                                                                  │
│  For each linked account:                                       │
│  ┌──────────────────────────────────────────────────┐          │
│  │ 🏦 TD Bank                                       │          │
│  │ Connected: Jan 15, 2026                          │          │
│  │                                                  │          │
│  │ Which card is this account for?                 │          │
│  │ [Dropdown: Select a card...]                    │          │
│  │   • TD Aeroplan Visa Infinite                   │          │
│  │   • TD Cash Back Visa                           │          │
│  │   • Amex Cobalt                                 │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                  │
│  [Cancel]  [Save Mappings]                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ POST /api/profile/card-mappings
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE STORAGE                              │
│                    CardMapping Table                             │
│                                                                  │
│  Stores:                                                        │
│  • linkedAccountId → userCardId                                 │
│  • One-to-one relationship                                      │
│  • Used to attribute transactions to specific cards             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Mapping complete
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              TRANSACTION ATTRIBUTION                             │
│                                                                  │
│  Now transactions can be:                                       │
│  • Linked to specific credit cards                             │
│  • Used for accurate reward calculations                        │
│  • Tracked per-card spending                                    │
└─────────────────────────────────────────────────────────────────┘
```

**Analytics Event:** `card_mapping_completed`

---

## Beta User Flow (STEP 8)

```
┌─────────────────────────────────────────────────────────────────┐
│                         NEW USER                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: SIGNUP                                                  │
│  • Create account (Clerk)                                        │
│  • Email verification                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: SPENDING PROFILE                                        │
│  • Enter monthly spending (grocery, gas, dining, bills)          │
│  • Select goal (travel destination, points needed)               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: RECOMMENDATION PREVIEW                                  │
│  • See top recommended card                                      │
│  • View earning potential                                        │
│  • Optimal roadmap displayed                                     │
│  📊 Event: recommendation_completed                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: PLAID CONNECT ⭐                                        │
│  • Click "Connect Your Bank"                                     │
│  • Plaid modal opens                                             │
│  • Select bank, authenticate                                     │
│  • Access token exchanged                                        │
│  📊 Event: plaid_connected                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: CARD MAPPING ⭐                                         │
│  • Map bank accounts to credit cards                             │
│  • Confirm which card is which                                   │
│  📊 Event: card_mapping_completed                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: OPTIMIZED RESULT                                        │
│  • Transactions sync automatically                               │
│  • Categories assigned with confidence                           │
│  • Rewards calculated per card                                   │
│  • Dashboard shows optimization                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7: PREMIUM INSIGHTS (Optional)                             │
│  • Upgrade to Premium ($9/month)                                 │
│  • Advanced AI comparisons                                       │
│  • Unlimited strategies                                          │
│  • Real-time alerts                                              │
│  📊 Event: premium_trial_started                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Feedback Loop:**
- At any point, user can submit feedback via BetaFeedbackWidget
- If category is wrong, user can correct via CategoryCorrectionModal
- Corrections improve AI accuracy for future transactions

---

## Landing Page Structure (STEP 9)

```
┌─────────────────────────────────────────────────────────────────┐
│                         HERO SECTION                             │
│                                                                  │
│  "Maximize Your Rewards"                                        │
│  Get a personalized credit card strategy                        │
│                                                                  │
│  [Get Started Free]  [How It Works]                             │
│                                                                  │
│  Trust Badges: VISA • Mastercard • Amex • TD • RBC • CIBC      │
└─────────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────────┤
│                      HOW IT WORKS                                │
│                                                                  │
│  1️⃣ Share Your Habits                                           │
│  2️⃣ AI-Powered Analysis                                         │
│  3️⃣ Maximize Your Rewards                                       │
└─────────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────────┤
│                         FEATURES                                 │
│                                                                  │
│  ✅ Always Up-to-Date    ✅ 100% Objective                      │
│  ✅ Privacy Focused      ✅ Smart Dashboard                     │
└─────────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────────┤
│                    CALCULATOR SECTION                            │
│                                                                  │
│  [Interactive spending form]                                    │
│  → Generates personalized roadmap                               │
└─────────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────────┤
│                         PRICING                                  │
│                                                                  │
│  FREE                          PREMIUM ($9/month)               │
│  • Basic route generation      • Everything in Free             │
│  • Manual tracking             • Advanced AI comparisons        │
│  • Card comparisons            • Unlimited strategies           │
│  • Save 3 strategies           • Plaid bank sync                │
│                                • Real-time alerts               │
└─────────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────────┤
│                   SECURITY & PRIVACY ⭐                          │
│                                                                  │
│  🔒 Bank-Level Encryption (AES-256)                             │
│  ✅ Plaid Secure Connection (credentials never stored)          │
│  ❌ No Data Selling (your data is yours)                        │
│                                                                  │
│  What We Do With Your Data:                                     │
│  ✅ Personalized recommendations                                │
│  ✅ Reward optimization                                         │
│  ✅ Service improvement                                         │
│  ❌ Never sell your data                                        │
│                                                                  │
│  Cancel Premium anytime with one click. No questions asked.     │
└─────────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────────┤
│                           FAQ ⭐                                 │
│                                                                  │
│  ❓ How does BonusGo make money?                                │
│  ❓ Is my banking information safe?                             │
│  ❓ What's the difference between Free and Premium?             │
│  ❓ Can I cancel Premium anytime?                               │
│  ❓ Which Canadian credit cards do you cover?                   │
│  ❓ How accurate are your recommendations?                      │
└─────────────────────────────────────────────────────────────────┘
```

**Key Trust Elements:**
- ✅ Clear security explanation
- ✅ Plaid security prominently featured
- ✅ "Never sell data" guarantee
- ✅ Cancellation policy visible
- ✅ Free vs Premium clearly explained
- ✅ FAQ addresses common concerns

---

## Data Flow Summary

```
USER INPUT
    ↓
PLAID API
    ↓
MERCHANT NORMALIZER ⭐ (NEW)
    ↓
CONFIDENCE SCORER ⭐ (ENHANCED)
    ↓
DATABASE (Transaction table) ⭐ (NEW)
    ↓
USER CORRECTION (if needed) ⭐ (NEW)
    ↓
REWARD ENGINE (deterministic)
    ↓
RECOMMENDATION ENGINE
    ↓
AI EXPLANATION (Gemini) - explains only, never calculates
    ↓
USER DASHBOARD
```

**Architecture Rules Enforced:**
1. ✅ Reward calculations are deterministic (reward engine only)
2. ✅ AI only explains results (no financial calculations)
3. ✅ Plaid transactions normalized before analysis
4. ✅ Card mapping exists (Plaid account → credit card)
5. ✅ Single source of truth (database for cards, constants for values)
6. ✅ Legacy modules marked deprecated
7. ✅ Dark-first UI
8. ✅ API-first architecture

---

## Component Hierarchy

```
app/
├── page.tsx ⭐ (MODIFIED)
│   ├── Hero Section
│   ├── How It Works
│   ├── Features
│   ├── Calculator
│   ├── Pricing
│   ├── Security & Privacy ⭐ (NEW)
│   └── FAQ ⭐ (NEW)
│
├── dashboard/
│   └── page.tsx
│       ├── BetaFeedbackWidget ⭐ (NEW)
│       ├── CardMappingModal ⭐ (NEW)
│       └── CategoryCorrectionModal ⭐ (NEW)
│
└── api/
    ├── plaid/
    │   ├── create-link-token/
    │   └── exchange-public-token/ ⭐ (MODIFIED)
    │
    ├── profile/
    │   └── card-mappings/ ⭐ (NEW)
    │
    ├── transactions/
    │   └── correct-category/ ⭐ (NEW)
    │
    ├── feedback/ ⭐ (NEW)
    │
    └── recommend/ ⭐ (MODIFIED)
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                         User                                     │
│  • id                                                            │
│  • clerkUserId                                                   │
│  • email                                                         │
│  • isPremium                                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
│ LinkedAccount    │  │ UserCard     │  │ Transaction  │ ⭐ NEW
│  • id            │  │  • id        │  │  • id        │
│  • plaidItemId   │  │  • cardId    │  │  • plaidTxId │
│  • institution   │  │  • openDate  │  │  • merchant  │
└────────┬─────────┘  └──────┬───────┘  │  • normalized│
         │                   │           │  • category  │
         │                   │           │  • confidence│
         └───────┬───────────┘           │  • needsReview│
                 │                       └──────────────┘
                 ▼
         ┌──────────────┐
         │ CardMapping  │ ⭐ NEW
         │  • id        │
         │  • accountId │
         │  • cardId    │
         └──────────────┘

┌──────────────────┐
│ BetaFeedback     │ ⭐ NEW
│  • id            │
│  • userId        │
│  • feedback      │
│  • source        │
└──────────────────┘
```

---

**Legend:**
- ⭐ = New or significantly modified
- ✅ = Architecture rule enforced
- 📊 = Analytics event tracked

**Created:** March 13, 2026  
**Version:** 1.0
