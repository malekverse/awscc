# Vercel Timezone Fix for Email Timestamps

## Problem
Emails sent from the application show incorrect timestamps in Outlook when deployed on Vercel. The timestamps appear 1 hour earlier than the actual submission time.

## Root Cause
- **Local Environment**: Runs in UTC+1 (Tunisia timezone)
- **Vercel Environment**: Runs in UTC (default for Vercel servers)
- **Email Service**: Was using simple time addition instead of proper timezone conversion

This mismatch caused a 1-hour delay in email timestamps when deployed to Vercel.

## Solution Implemented

### 1. Updated Email Service (`lib/email-service.ts`)
- Replaced simple time addition with robust `Intl.DateTimeFormat` implementation
- Uses configurable timezone via `APP_TIMEZONE` environment variable
- Defaults to `'Africa/Tunis'` for proper timezone conversion
- Works correctly regardless of server timezone (UTC on Vercel, UTC+1 locally)

### 2. Updated Test Script (`scripts/test-email-timezone.js`)
- Uses the same robust timezone implementation as the email service
- Allows testing the fix locally before deployment

### 3. Environment Configuration
- Uses `APP_TIMEZONE` environment variable instead of reserved `TZ` variable
- Local environment configured in `.env.local`

## Deployment Steps

1. **Set Environment Variable in Vercel Dashboard**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add a new environment variable:
     - **Name**: `APP_TIMEZONE`
     - **Value**: `Africa/Tunis`
     - **Environments**: Select all (Production, Preview, Development)
   - Save the changes

2. **Deploy the Code Changes**:
   - Commit and push the updated files
   - Vercel will automatically deploy the changes

## Testing the Fix

1. **Local Testing**:
   ```bash
   node scripts/test-email-timezone.js
   ```

2. **Production Testing**:
   - Submit a form on the deployed application
   - Check the received email timestamp in Outlook
   - The timestamp should now match the actual submission time

## Technical Details

The fix uses `Intl.DateTimeFormat` with configurable timezone (via `APP_TIMEZONE` environment variable) to ensure proper timezone conversion regardless of the server's system timezone. This approach is more robust than simple time arithmetic and handles daylight saving time changes automatically.

**Note**: We use `APP_TIMEZONE` instead of `TZ` because Vercel reserves the `TZ` environment variable name.