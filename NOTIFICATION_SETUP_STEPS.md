# 🔔 Push Notifications - Setup Steps

## Quick Setup Guide

### Step 1: Install Dependencies
```bash
cd mobile
npm install expo-notifications expo-device
```

### Step 2: Run Database Migration
```bash
# Apply the migration to add push_tokens table
supabase db push supabase/migrations/013_add_push_tokens.sql

# Or if using Supabase CLI:
supabase migration up
```

### Step 3: Update Backend
The backend notification routes are already created. Just make sure your backend is running:
```bash
cd backend
npm install
npm run dev
```

### Step 4: Build and Run Mobile App
```bash
cd mobile

# For Android
npm run android

# For iOS (Mac only)
npm run ios
```

### Step 5: Test Notifications

#### Test on Physical Device (Required for Push Notifications)
1. Build and install app on physical device
2. Login as a student
3. Check console for push token
4. Grant notification permissions when prompted

#### Test Local Notifications
```typescript
// In your app, you can test like this:
import NotificationService from './services/NotificationService';

// Test bus approaching
await NotificationService.sendBusApproachingNotification(
  'Bus 101',
  5,
  'bus-uuid'
);
```

#### Test via Backend API
```bash
# Send notification to specific user
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-here",
    "title": "Test Notification",
    "message": "This is a test notification",
    "type": "info"
  }'

# Broadcast to all students
curl -X POST http://localhost:3000/api/notifications/broadcast-role \
  -H "Content-Type: application/json" \
  -d '{
    "role": "student",
    "title": "Important Update",
    "message": "All buses will run 30 minutes late today",
    "type": "warning"
  }'
```

## Features Available

### 1. Automatic Notifications
- ✅ Bus approaching (within 1km)
- ✅ Route changes
- ✅ Delays
- ✅ Emergency alerts
- ✅ Daily reminders

### 2. Notification Screen
- View all notifications
- Unread count badge
- Mark as read
- Clear all
- Pull to refresh

### 3. Notification Settings
- Toggle notification types
- Customize preferences
- Saved to database

### 4. Backend API
- Send to specific user
- Broadcast to multiple users
- Broadcast by role
- Expo push integration

## Troubleshooting

### Notifications Not Showing
1. **Check Permissions**
   - Go to: Settings → Apps → RouteBuddy → Notifications
   - Ensure notifications are enabled

2. **Verify Push Token**
   ```sql
   -- Check if token is saved
   SELECT * FROM push_tokens WHERE user_id = 'your-user-id';
   ```

3. **Check Notification Preferences**
   ```sql
   -- Check user preferences
   SELECT notification_preferences FROM profiles WHERE id = 'your-user-id';
   ```

4. **Physical Device Required**
   - Push notifications don't work on emulators
   - Use a real Android/iOS device

### Badge Count Not Updating
```typescript
import NotificationService from './services/NotificationService';

// Manually set badge count
await NotificationService.setBadgeCount(5);

// Get current badge count
const count = await NotificationService.getBadgeCount();
```

### Distance Calculation Issues
1. Verify stop coordinates are correct:
   ```sql
   SELECT * FROM stop_coordinates;
   ```

2. Check driver location is updating:
   ```sql
   SELECT * FROM locations WHERE user_id = 'driver-id' ORDER BY updated_at DESC LIMIT 1;
   ```

3. Adjust proximity threshold in `NotificationTriggerService.ts`:
   ```typescript
   private readonly PROXIMITY_THRESHOLD = 1000; // Change to 2000 for 2km
   ```

## Configuration Options

### Notification Check Interval
In `NotificationTriggerService.ts`:
```typescript
private readonly CHECK_INTERVAL = 30000; // 30 seconds (change as needed)
```

### Notification Cooldown
Prevents duplicate notifications within 10 minutes:
```typescript
.gte('created_at', new Date(Date.now() - 600000).toISOString()) // Change 600000 for different cooldown
```

### Expo Push Notification Limits
- Max 100 notifications per request
- Automatically batched in backend

## Next Steps

1. **Add Notification Sounds**
   - Place sound files in `mobile/assets/`
   - Update `app.json` with sound paths

2. **Schedule Daily Reminders**
   - Use cron job or scheduled task
   - Call `NotificationTriggerService.scheduleDailyReminder()`

3. **Add Rich Notifications**
   - Images
   - Action buttons
   - Custom layouts

4. **Analytics**
   - Track notification open rates
   - Monitor engagement
   - A/B test notification content

## Important Notes

- ⚠️ Push notifications require physical device
- ⚠️ Expo push tokens start with "ExponentPushToken"
- ⚠️ Emergency alerts cannot be disabled
- ⚠️ Background location required for proximity detection
- ⚠️ Battery optimization may affect notification delivery

## Support

If you encounter issues:
1. Check console logs for errors
2. Verify database migrations ran successfully
3. Ensure all dependencies are installed
4. Test on physical device, not emulator
5. Check notification permissions in device settings

---

**Status**: ✅ Ready to Use
**Last Updated**: March 14, 2026
