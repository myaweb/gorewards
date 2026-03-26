# Data Architecture: Database as Source of Truth

## 🎯 Core Principle

**The PostgreSQL database is the single source of truth for all card data.**

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                   │
│                  (Single Source of Truth)                │
└─────────────────────────────────────────────────────────┘
                            │
                            ├─────────────────────────────┐
                            ↓                             ↓
                    ┌───────────────┐           ┌──────────────────┐
                    │   Admin API   │           │  Public API      │
                    │   /api/admin  │           │  /api/cards      │
                    └───────────────┘           └──────────────────┘
                            │                             │
                            ↓                             ↓
                  ┌──────────────────┐          ┌─────────────────┐
                  │ Admin Dashboard  │          │    Frontend     │
                  │  /admin          │          │  (Homepage,     │
                  │                  │          │   Compare, etc) │
                  └──────────────────┘          └─────────────────┘
```

## 🗂️ Database Tables

### Core Tables
- **Card**: Credit card details (name, bank, annual fee, etc.)
- **CardBonus**: Welcome bonuses and signup offers
- **CardMultiplier**: Category earning rates (5x grocery, 2x gas, etc.)

### Supporting Tables
- **Goal**: Redemption goals (Tokyo Flight, Cashback, etc.)
- **User**: User accounts and premium status
- **UserCard**: User's owned cards
- **Transaction**: Plaid transaction data
- **LinkedAccount**: Connected bank accounts

## 🔄 Data Operations

### ✅ Correct: Database-First Operations

#### 1. Frontend Data Fetching
```typescript
// app/page.tsx
const response = await fetch(`/api/cards?pointType=AEROPLAN`)
const { data } = await response.json()
// ✅ Data comes from database
```

#### 2. Admin Updates
```typescript
// components/admin-dashboard.tsx
await updateCardAffiliateLink(cardId, newLink)
// ✅ Updates database directly
```

#### 3. Card Recommendations
```typescript
// lib/services/routeEngine.ts
const cards = await CardService.getCardsByPointType('AEROPLAN')
// ✅ Fetches from database
```

### ⚠️ Reference Only: cardData.ts

**Purpose**: Initial setup and backup reference

**Usage**:
```typescript
// prisma/seed.ts - Initial database population
import { canadianCardsMasterList } from './app/lib/cardData'
// ✅ Used ONLY for initial seeding
```

**NOT for**:
- ❌ Runtime operations
- ❌ Frontend data fetching
- ❌ Regular updates

## 🛠️ Admin Workflow

### Adding a New Card

**Method 1: Direct Database (Recommended)**
1. Go to Admin Dashboard (`/admin`)
2. Click "Create New Card" (future feature)
3. Fill in card details
4. Save → Goes directly to database

**Method 2: Bulk Import (Initial Setup)**
1. Add card to `cardData.ts`
2. Go to Admin Dashboard
3. Click "Sync 50+ Cards Database"
4. Cards imported to database

### Updating Card Information

**Correct Way** ✅
1. Admin Dashboard → Find card
2. Click "Edit"
3. Update details
4. Save → Database updated
5. Changes immediately visible on frontend

**Wrong Way** ❌
1. ~~Edit cardData.ts~~
2. ~~Hope it syncs somehow~~
3. ~~Confusion about which data is current~~

## 📈 Benefits of This Architecture

### 1. Single Source of Truth
- No confusion about which data is current
- Database is always authoritative

### 2. Real-Time Updates
- Admin changes → Immediate frontend updates
- No sync delays or inconsistencies

### 3. Scalability
- Easy to add new cards via admin panel
- No code deployment needed for data updates

### 4. Data Integrity
- Database constraints ensure valid data
- Relationships maintained (cards → bonuses → multipliers)

### 5. Audit Trail
- All changes logged in database
- UpdateRecord table tracks modifications

## 🔐 Security

### Admin Access
- Protected by `ADMIN_CLERK_ID` environment variable
- Only authorized users can modify data

### API Endpoints
- Public: `/api/cards` (read-only)
- Admin: `/api/admin/*` (requires authentication)

## 🚀 Production Workflow

### Initial Setup
```bash
# 1. Set up database
npx prisma migrate deploy

# 2. Seed initial data
npx prisma db seed

# 3. Verify in admin dashboard
# Visit /admin and check card count
```

### Regular Operations
```
Admin Dashboard → Edit Cards → Database Updated → Frontend Reflects Changes
```

### Backup Strategy
```
Database (Primary) → Regular Backups → cardData.ts (Reference)
```

## 📝 Summary

| Component | Role | Data Source |
|-----------|------|-------------|
| **Database** | Source of Truth | N/A (Primary) |
| **Admin Dashboard** | Management UI | Database |
| **Frontend** | User Interface | Database (via API) |
| **cardData.ts** | Reference/Backup | Static file |
| **Seed Script** | Initial Setup | cardData.ts → Database |

## ✅ Best Practices

1. **Always fetch from database** for runtime operations
2. **Use admin dashboard** for updates
3. **Keep cardData.ts** as reference only
4. **Regular database backups** for disaster recovery
5. **Monitor database** for performance and integrity

---

**Last Updated**: March 13, 2026
**Architecture Version**: 2.0 (Database-First)
