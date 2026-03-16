# 🚀 Quick Start Guide - Bus Bay Web Dashboard

## Step-by-Step Instructions

### 1. Open Terminal in Project Root
```bash
cd "C:\bus bay"
```

### 2. Install Dependencies (First Time Only)
```bash
npm install
```

This will install all required packages (~2-3 minutes).

### 3. Start the Development Server
```bash
npm run dev
```

### 4. Open in Chrome
The terminal will show:
```
  ➜  Local:   http://localhost:8080/
  ➜  Network: http://192.168.x.x:8080/
```

**Open Chrome and go to:** `http://localhost:8080`

## 🎯 What You'll See

### Landing Page (/)
- Beautiful hero section
- Feature showcase
- "Get Started" button → Login page

### Login Page (/login)
**Demo Credentials:**
- **Admin:** ID = `ADM001`, Password = `any`
- **Driver:** ID = `DRV001`, Password = `any`
- **Student:** ID = `STU001`, Password = `any`

### Dashboards

#### Admin Dashboard (/admin)
- Total users: 245
- Active drivers: 12
- Students: 233
- Active buses: 8
- Bus management interface
- Real-time status cards

#### Driver Dashboard (/driver)
- View assigned bus
- Start/stop journey
- Route information
- Student count

#### Student Dashboard (/student)
- View available buses
- Track bus location
- See route stops
- Get ETA

## 🛠️ Troubleshooting

### Port Already in Use
If port 8080 is busy:
```bash
npm run dev -- --port 3000
```
Then open: `http://localhost:3000`

### Dependencies Not Installed
```bash
npm install
```

### Clear Cache
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📱 Access from Phone

1. Make sure your phone and computer are on the same WiFi
2. Look for the "Network" URL in terminal (e.g., `http://192.168.1.100:8080`)
3. Open that URL on your phone's browser

## 🎨 Features to Try

1. **Landing Page**
   - Click "Get Started"
   - Scroll through features
   - Responsive design

2. **Login**
   - Try different user IDs (ADM, DRV, STU)
   - Toggle password visibility
   - See role-based routing

3. **Admin Dashboard**
   - View statistics
   - See active buses
   - Click refresh button
   - Try quick action cards

4. **Navigation**
   - Use browser back/forward
   - Direct URL access
   - Logout functionality

## 🔥 Hot Reload

The dev server supports hot reload:
- Edit any file in `src/`
- Save the file
- Browser automatically updates
- No need to refresh!

## 🚀 Production Build

To create a production build:
```bash
npm run build
```

Output will be in `dist/` folder.

To preview production build:
```bash
npm run preview
```

## 📊 Project Status

✅ Landing page - Complete
✅ Login system - Complete
✅ Admin dashboard - Complete
✅ Driver dashboard - Complete
✅ Student dashboard - Complete
✅ Routing - Complete
✅ Responsive design - Complete
✅ Demo mode - Complete

## 🎯 Next Steps

1. **Connect to Supabase:**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials
   - Real data will replace mock data

2. **Customize:**
   - Edit colors in `src/index.css`
   - Modify components in `src/components/`
   - Update pages in `src/pages/`

3. **Deploy:**
   - Build: `npm run build`
   - Deploy `dist/` folder to any hosting service

## 💡 Tips

- **F12** - Open Chrome DevTools
- **Ctrl+Shift+R** - Hard refresh
- **Ctrl+Shift+M** - Toggle mobile view
- **Ctrl+Shift+I** - Inspect element

## 📞 Need Help?

Check:
1. Terminal for error messages
2. Browser console (F12)
3. `WEB_DASHBOARD_README.md` for detailed docs
4. Network tab in DevTools for API issues

---

**Enjoy your Bus Bay Web Dashboard! 🎉**
