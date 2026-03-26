# Plaid Multiple Bank Accounts Support

## Overview
Updated the Plaid integration to support connecting multiple bank accounts instead of just one. Users can now connect unlimited banks and the "Add Another Bank" button remains visible at all times.

## Changes Made

### 1. PlaidConnectButton Component (`components/plaid-connect-button.tsx`)

**Added:**
- `hasExistingAccounts` prop to change button styling based on whether accounts exist
- Dynamic button text: "Connect Your Bank" → "Add Another Bank"
- Two visual styles:
  - **Primary (no accounts)**: Gradient cyan button with glow effect
  - **Secondary (has accounts)**: Dashed border, transparent background, cyan text

**Props:**
```typescript
interface PlaidConnectButtonProps {
  onSuccess?: () => void
  hasExistingAccounts?: boolean  // NEW
}
```

### 2. PlaidSection Component (`components/plaid-section.tsx`)

**Updated:**
- Button is now ALWAYS visible (not hidden after first connection)
- Shows "Connected Accounts (X)" header when accounts exist
- Maps through ALL linked accounts and displays each one
- Button styling changes based on `hasAccounts` state

**Visual Flow:**

**Before (No Accounts):**
```
┌─────────────────────────────────┐
│  🏦 (icon)                      │
│  No bank accounts connected yet │
│                                 │
│  [Connect Your Bank] (primary)  │
└─────────────────────────────────┘
```

**After (1+ Accounts):**
```
┌─────────────────────────────────┐
│  Connected Accounts (2)         │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🏦 RBC Royal Bank       │   │
│  │ Connected 1/8/2025   ✓  │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🏦 TD Bank              │   │
│  │ Connected 1/8/2025   ✓  │   │
│  └─────────────────────────┘   │
│                                 │
│  [Add Another Bank] (dashed)    │
└─────────────────────────────────┘
```

### 3. SpendingForm Component (`components/spending-form.tsx`)

**Updated:**
- Changed `onSuccess` callback to reload page (shows newly connected bank)
- No state management needed here (just a CTA)

## Key Features

### ✅ Multiple Accounts Support
- Users can connect unlimited bank accounts
- Each connection is saved to the database independently
- All accounts are displayed in a list

### ✅ Persistent Button
- "Add Another Bank" button ALWAYS visible
- Never disappears after first connection
- Visual hierarchy maintained with dashed border style

### ✅ Visual Differentiation
- **First connection**: Bold gradient button with glow
- **Additional connections**: Subtle dashed border button
- Clear visual hierarchy guides user behavior

### ✅ Database Integration
- Backend already supports multiple accounts (LinkedAccount model)
- Each account has unique `plaidItemId` and `plaidAccessToken`
- Proper user association via `userId` foreign key

## Button Styling

### Primary Style (No Accounts)
```css
bg-gradient-to-r from-primary to-cyan-400
shadow-xl shadow-primary/30
hover:scale-105
```

### Secondary Style (Has Accounts)
```css
border-2 border-dashed border-primary/50
bg-transparent
text-cyan-400
hover:bg-primary/10
```

## Testing

1. Navigate to `/dashboard`
2. Click "Connect Your Bank"
3. Complete Plaid flow with sandbox credentials:
   - Username: `user_good`
   - Password: `pass_good`
4. After success, page reloads showing connected bank
5. Click "Add Another Bank" to connect more accounts
6. Repeat as many times as needed

## Database Schema

The `LinkedAccount` model already supports multiple accounts:

```prisma
model LinkedAccount {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  plaidItemId       String   @unique
  plaidAccessToken  String
  institutionName   String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

Each user can have multiple `LinkedAccount` records.

## Future Enhancements

- Add "Remove Account" button for each connected bank
- Show account balances and transaction counts
- Add account refresh/sync functionality
- Display last sync timestamp
- Add account nickname/label feature
