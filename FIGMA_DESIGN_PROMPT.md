# 🎨 Navy Route Buddy - Figma Design Prompt

## 📱 App Overview
**Bus tracking app** for Navy personnel with 3 roles: Admin, Driver, Student

## 🎨 Colors
**Light:** Primary `#1e3a8a`, Success `#10b981`, Error `#dc2626`, Background `#f5f5f5`  
**Dark:** Primary `#3b82f6`, Background `#1a1a1a`, Card `#2d2d2d`

## 📲 7 Screens to Design

### 1. LOGIN 🔐
- Title "Navy Route Buddy" + subtitle
- 3 role pills: Student/Driver/Admin (active = navy blue)
- Email + Password inputs (password has eye icon)
- Helper text for students
- Full-width login button

### 2. STUDENT DASHBOARD 👨‍🎓
- Header: title, email, profile icon, menu icon
- Map (300px): blue marker (student), red marker (bus)
- Bus Status Card: route, ETA, next stop
- Profile Modal: photo (120px circle), ID, name, email, phone, status badge
- Photo Modal: Take Photo / Choose Gallery options

### 3. DRIVER DASHBOARD 🚗
- Header: title, email, profile icon, menu
- Map (300px): red marker (driver location)
- Big button: "Start/Stop Tracking" (green/red)
- Route Info Card: name, students count, status, speed, accuracy
- Logout button (red)

### 4. ADMIN DASHBOARD 👨‍💼
- Header: title, welcome text, profile icon
- 4 Stat Cards (2x2): Total Users, Drivers, Students, Active Routes
- Active Routes list: route name, driver, status badge
- Recent Users list: email, name, role badge
- Side Drawer: Dashboard, Manage Buses, Manage Students, Settings, Logout

### 5. MANAGE BUSES 🚌
- Header: title + green "Add Bus" button
- Bus Cards: driver photo (80px), bus number, route, driver info, stops preview, status, Edit/Delete buttons
- Add/Edit Modal: bus number, route, driver details (name, mobile, email, password), photo upload, stops list with add/remove
- Photo Modal: Camera / Gallery options

### 6. MANAGE STUDENTS 👥
- Header: title + green "Add Student" button
- Search bar with clear button
- Info box: "Only students added here can login"
- Student Cards: name, ID, email, phone, status badge, Suspend/Edit/Delete buttons
- Add/Edit Modal: Student ID, name, password (with eye icon), email, phone

### 7. SETTINGS ⚙️
- Language Card: English / हिंदी buttons (active = navy blue)
- Theme Card: ☀️ Light / 🌙 Dark buttons (active = navy blue)

## 🧩 Components
**Buttons:** Primary (navy), Success (green), Danger (red), Warning (orange), Pill (rounded)  
**Inputs:** Text, Password (eye icon), Search (clear button)  
**Cards:** Info, Stat, User, Bus, Student  
**Modals:** Full (forms), Bottom Sheet (options)  
**Status:** Badges (colored), Dots (🟢🔴)

## 📐 Specs
- Screen: 375x812 (iPhone X)
- Padding: 15px sides
- Border Radius: 8px buttons, 10px cards, 50% photos
- Shadow: 0px 2px 4px rgba(0,0,0,0.1)
- Typography: Title 24-32px Bold, Body 14-16px Regular

## 🎯 Key Features
- Bilingual (English/Hindi)
- Light + Dark themes
- Map with markers
- Photo upload
- Real-time tracking
- Role-based access

**Goal:** Modern, clean, mobile-first design for bus tracking with 3 user roles.
