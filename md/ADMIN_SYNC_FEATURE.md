# Admin Dashboard - Card Sync Feature

## Overview

The Admin Dashboard now includes a **Database Management** section that allows administrators to sync the credit card database with a single click.

## Location

Navigate to: `/admin`

The Database Management section appears right after the metrics cards, before the tabs section.

## Features

### 1. Database Management Card

A prominent card with an amber/orange theme that stands out from other sections:

- **Icon**: Database icon with amber color
- **Title**: "Database Management"
- **Description**: Clear explanation of the sync functionality

### 2. Sync Button

**Visual Design:**
- Gradient background: amber-500 to orange-500
- Glowing shadow effect (amber glow)
- Large size for prominence
- Database icon + text label

**Button States:**

**Idle State:**
```
[Database Icon] Sync 50+ Cards Database
```

**Loading State:**
```
[Spinning Loader] Syncing Database...
```
- Button is disabled during sync
- Spinner animation indicates progress

### 3. Real-time Statistics

Before syncing, the card displays:
- **32 cards in master list** (with primary color indicator)
- **X cards in database** (with amber color indicator)

### 4. Success Notification

After successful sync, a detailed results panel appears showing:

**Sync Completed Successfully** ✓

| Metric | Value |
|--------|-------|
| Total Cards | 32 |
| Created | X |
| Updated | Y |
| Errors | 0 |

Plus timestamp: "Last synced: [date/time]"

### 5. User Feedback

**Success Alert:**
```
✅ Successfully synced 32 cards!

Created: 29
Updated: 3
Errors: 0
```

**Error Alert:**
```
❌ Sync failed: [error message]
```

## Technical Implementation

### State Management

```typescript
const [isSyncing, setIsSyncing] = useState(false)
const [syncResult, setSyncResult] = useState<any>(null)
```

### Sync Handler

```typescript
async function handleSyncCards() {
  setIsSyncing(true)
  setSyncResult(null)

  try {
    const response = await fetch('/api/admin/sync-cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (data.success) {
      setSyncResult(data)
      await loadData() // Reload dashboard data
      
      // Show success alert
      alert(`✅ Successfully synced ${data.stats.totalInDatabase} cards!...`)
    } else {
      alert(`❌ Sync failed: ${data.error}`)
    }
  } catch (error) {
    alert('❌ Failed to sync cards. Please try again.')
  } finally {
    setIsSyncing(false)
  }
}
```

### API Integration

**Endpoint:** `POST /api/admin/sync-cards`

**Response Format:**
```json
{
  "success": true,
  "message": "Card sync completed successfully",
  "stats": {
    "totalInMasterList": 32,
    "created": 29,
    "updated": 3,
    "errors": 0,
    "totalInDatabase": 32
  },
  "timestamp": "2024-03-08T12:00:00.000Z"
}
```

## User Flow

1. **Admin navigates to `/admin`**
   - Sees Database Management section
   - Views current card count in database

2. **Admin clicks "Sync 50+ Cards Database"**
   - Button shows loading state
   - Button is disabled during sync
   - Text changes to "Syncing Database..."

3. **Sync completes**
   - Success alert appears with statistics
   - Results panel displays below button
   - Dashboard data refreshes automatically
   - Button returns to idle state

4. **Admin reviews results**
   - Sees how many cards were created
   - Sees how many cards were updated
   - Checks for any errors
   - Views timestamp of sync

## Styling

### Color Scheme

- **Primary Color**: Amber (#f59e0b)
- **Secondary Color**: Orange (#f97316)
- **Glow Effect**: `shadow-[0_0_20px_rgba(245,158,11,0.4)]`
- **Border**: `border-amber-500/30`
- **Background**: `from-amber-500/5 to-transparent`

### Visual Hierarchy

1. **Amber border** - Makes the card stand out
2. **Gradient background** - Subtle amber tint
3. **Glowing button** - Draws attention to action
4. **Success panel** - Primary color for positive feedback

## Security Considerations

⚠️ **Important**: This feature should only be accessible to administrators.

**Current Implementation:**
- Located at `/admin` route
- Should be protected by authentication middleware

**Recommended Enhancements:**
```typescript
// Add admin check in the sync endpoint
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  
  // Check if user is admin
  if (!userId || !isAdmin(userId)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // ... rest of sync logic
}
```

## Maintenance

### Updating Card Count

The "32 cards in master list" is hardcoded. Update this when adding more cards:

```typescript
<span>32 cards in master list</span>
```

Change to:
```typescript
<span>{canadianCardsMasterList.length} cards in master list</span>
```

### Customizing Success Message

Edit the alert message in `handleSyncCards()`:

```typescript
alert(
  `✅ Successfully synced ${data.stats.totalInDatabase} cards!\n\n` +
  `Created: ${data.stats.created}\n` +
  `Updated: ${data.stats.updated}\n` +
  `Errors: ${data.stats.errors}`
)
```

## Testing

### Manual Testing Steps

1. Navigate to `/admin`
2. Verify Database Management section appears
3. Click "Sync 50+ Cards Database"
4. Verify button shows loading state
5. Wait for sync to complete
6. Verify success alert appears
7. Verify results panel displays
8. Check that card count updates in metrics
9. Verify timestamp is accurate

### Expected Results

**First Sync (Empty Database):**
- Created: 32
- Updated: 0
- Errors: 0
- Total: 32

**Subsequent Syncs (No Changes):**
- Created: 0
- Updated: 32
- Errors: 0
- Total: 32

**After Adding New Cards:**
- Created: X (new cards)
- Updated: 32 (existing cards)
- Errors: 0
- Total: 32 + X

## Troubleshooting

### Button Doesn't Respond

**Check:**
- Is the button disabled?
- Are there console errors?
- Is the API endpoint accessible?

### Sync Fails

**Common Issues:**
1. Database connection error
2. Prisma schema not updated
3. Invalid card data in master list
4. Network timeout

**Solution:**
```bash
# Verify database connection
npx prisma db push

# Check API endpoint
curl -X POST http://localhost:3000/api/admin/sync-cards

# Review server logs
```

### Results Don't Display

**Check:**
- Is `syncResult` state being set?
- Is the API returning the correct format?
- Are there any React rendering errors?

## Future Enhancements

- [ ] Add progress bar during sync
- [ ] Show detailed error messages per card
- [ ] Add ability to sync individual cards
- [ ] Schedule automatic syncs
- [ ] Add rollback functionality
- [ ] Export sync logs
- [ ] Email notifications on sync completion
- [ ] Dry-run mode to preview changes

## Related Documentation

- [Card Sync Bot Documentation](./CARD_SYNC_BOT.md)
- [Admin Dashboard Overview](./ADMIN_DASHBOARD.md)
- [API Documentation](./API_DOCUMENTATION.md)
