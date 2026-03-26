# The Money Router - Flow Diagram

## User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Views Comparison Page                    │
│              /compare/amex-cobalt-vs-td-aeroplan                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  User Clicks "Apply Now" Button                  │
│              href="/api/go/amex-cobalt-card"                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Money Router API Route                        │
│              GET /api/go/[slug]/route.ts                         │
│                                                                   │
│  1. Extract slug from URL params                                 │
│  2. Convert slug to searchable format                            │
│     "amex-cobalt-card" → "amex cobalt card"                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database Query (Prisma)                       │
│                                                                   │
│  prisma.card.findFirst({                                         │
│    where: {                                                      │
│      name: { contains: "amex cobalt card" },                     │
│      isActive: true                                              │
│    }                                                             │
│  })                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌───────────────────┐     ┌──────────────────────┐
    │  Card Not Found   │     │    Card Found        │
    │  or No Affiliate  │     │  with Affiliate Link │
    │      Link         │     │                      │
    └─────────┬─────────┘     └──────────┬───────────┘
              │                          │
              │                          ▼
              │              ┌──────────────────────────┐
              │              │  Increment Click Count   │
              │              │  (Fire & Forget)         │
              │              │                          │
              │              │  prisma.card.update({    │
              │              │    data: {               │
              │              │      clickCount: {       │
              │              │        increment: 1      │
              │              │      }                   │
              │              │    }                     │
              │              │  })                      │
              │              └──────────┬───────────────┘
              │                         │
              ▼                         ▼
    ┌──────────────────┐     ┌──────────────────────────┐
    │  Redirect to     │     │  Redirect to Affiliate   │
    │  /compare        │     │  URL (Bank Website)      │
    │  (Fallback)      │     │                          │
    └──────────────────┘     └──────────┬───────────────┘
                                        │
                                        ▼
                             ┌──────────────────────────┐
                             │  User Lands on Bank's    │
                             │  Application Page        │
                             │  (External Site)         │
                             └──────────────────────────┘
```

## Data Flow

```
┌──────────────────┐
│  Card Database   │
│                  │
│  - id            │
│  - name          │
│  - affiliateLink │◄────┐
│  - clickCount    │     │
│  - isActive      │     │
└────────┬─────────┘     │
         │               │
         │ Query         │ Update
         │               │
         ▼               │
┌──────────────────┐     │
│  Money Router    │─────┘
│  API Route       │
│                  │
│  /api/go/[slug]  │
└────────┬─────────┘
         │
         │ Redirect
         │
         ▼
┌──────────────────┐
│  Bank Website    │
│  (Affiliate URL) │
└──────────────────┘
```

## Component Integration

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Components                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐    ┌──────────────────────┐
│  card-comparison.tsx │    │  structured-data.tsx │
│                      │    │                      │
│  createSlug()        │    │  createSlug()        │
│  ↓                   │    │  ↓                   │
│  /api/go/[slug]      │    │  /api/go/[slug]      │
└──────────┬───────────┘    └──────────┬───────────┘
           │                           │
           └───────────┬───────────────┘
                       │
                       ▼
           ┌───────────────────────┐
           │   Money Router API    │
           │   /api/go/[slug]      │
           └───────────┬───────────┘
                       │
                       ▼
           ┌───────────────────────┐
           │   Prisma Database     │
           │   Card.clickCount++   │
           └───────────┬───────────┘
                       │
                       ▼
           ┌───────────────────────┐
           │   Admin Dashboard     │
           │   Display Clicks      │
           └───────────────────────┘
```

## Slug Generation Logic

```
Card Name: "American Express Cobalt Card"
           ↓
Step 1: Lowercase
        "american express cobalt card"
           ↓
Step 2: Remove special characters
        "american express cobalt card"
           ↓
Step 3: Replace spaces with hyphens
        "american-express-cobalt-card"
           ↓
Step 4: Remove duplicate hyphens
        "american-express-cobalt-card"
           ↓
Final Slug: "american-express-cobalt-card"

URL: /api/go/american-express-cobalt-card
```

## Analytics Flow

```
┌──────────────┐
│  User Click  │
└──────┬───────┘
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌──────────────┐              ┌──────────────────┐
│  PostHog     │              │  Money Router    │
│  Event       │              │  Click Counter   │
│              │              │                  │
│  Tracks:     │              │  Increments:     │
│  - cardName  │              │  - clickCount    │
│  - cardId    │              │    in database   │
│  - position  │              │                  │
│  - timestamp │              │                  │
└──────────────┘              └──────────────────┘
       │                                 │
       └─────────────┬───────────────────┘
                     │
                     ▼
           ┌──────────────────┐
           │  Admin Dashboard │
           │  Shows Both:     │
           │  - Total Clicks  │
           │  - Analytics     │
           └──────────────────┘
```

## Error Handling

```
┌──────────────────┐
│  Money Router    │
│  Receives Request│
└────────┬─────────┘
         │
         ▼
    ┌────────┐
    │ Try    │
    └───┬────┘
        │
        ├─── Card Found? ──────► Yes ──► Has Affiliate Link? ──► Yes ──► Redirect
        │                                                        │
        │                                                        No
        │                                                        │
        ▼                                                        ▼
    ┌────────────┐                                    ┌──────────────────┐
    │  Catch     │                                    │  Redirect to     │
    │  Error     │                                    │  /compare        │
    └─────┬──────┘                                    │  (Fallback)      │
          │                                           └──────────────────┘
          ▼
    ┌──────────────────┐
    │  Log Error       │
    │  Redirect to     │
    │  /compare        │
    │  (Fallback)      │
    └──────────────────┘
```
