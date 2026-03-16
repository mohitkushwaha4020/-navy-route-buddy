# 📍 Simplified Pickup Address Approach

## ✅ Changes Made So Far:

### ManageStudents Screen:
1. ✅ Removed bus selection dropdown
2. ✅ Only pickup address selection remains
3. ✅ Shows all unique pickup addresses from all buses
4. ✅ Student card shows only pickup address
5. ✅ Removed bus_id from save logic

## 🎯 What Needs to Happen Next:

### StudentDashboard Logic:
Student should see **ALL buses** that stop at their pickup address.

### Current Issue:
- Code references `busDriverId` (single bus)
- Need to change to `busDriverIds` (multiple buses)
- Need to track multiple buses on map

## 🚀 Recommended Simple Solution:

Instead of complex multi-bus tracking, keep it simple:

### Option 1: Show Closest Bus (EASIEST) ✅
```typescript
// In StudentDashboard:
1. Get student's pickup_address
2. Find ALL buses with that stop
3. Track all their locations
4. Show ONLY the CLOSEST bus on map
5. Update when a closer bus appears
```

### Option 2: Show All Buses (COMPLEX)
```typescript
// Multiple markers on map
1. Get all buses for pickup address
2. Show all as markers
3. Calculate distance to each
4. Show closest one's ETA
```

## 📝 Quick Fix for Now:

Keep current single-bus logic but:
1. Find first bus that stops at pickup address
2. Track that bus
3. Later can enhance to show all buses

## 🔧 Code Changes Needed:

```typescript
// In fetchStudentDetails:
const pickupAddr = data.pickup_address;

// Find first bus with this stop
const { data: buses } = await supabase
  .from('buses')
  .select('*')
  .contains('stops', [pickupAddr])
  .limit(1)
  .single();

if (buses?.driver_id) {
  setBusDriverId(buses.driver_id);
}
```

This keeps it simple for now!

## ✅ Summary:

**Current Status:**
- Admin side: ✅ Complete (only pickup address)
- Student side: ⚠️ Needs update (still looking for single bus)

**Next Step:**
Update StudentDashboard to find buses by pickup address instead of bus_id.
