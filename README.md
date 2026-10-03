# 🚖 Pi-Pip-Pip Cab Service

A full-stack, enterprise-grade cab booking & fleet operations platform built using Express.js, MongoDB, React, TailwindCSS, Socket.IO, and Razorpay.

---

## 🚀 System Architecture & Capabilities

### Phase 1–3: Core Booking & Operations
- **Interactive Booking Flow**: Automatic route distance calculation, package pricing (Local, Outstation, Airport, Hourly), vehicle selection, and coupon discounts.
- **Admin Management Panel**: Dashboard stats, booking management, driver roster, vehicle fleet, and custom fare rule engines.

### Phase 4A–4C: Payments, Accounts, Reviews & SEO
- **Razorpay Payment Gateway**: Test mode integration supporting full payments & 20% advance deposits.
- **Customer Accounts**: Secure customer authentication, booking history, and cancellation management.
- **Reviews & Ratings**: Post-trip customer reviews with admin moderation.
- **SEO & Meta Tags**: Dynamic Helmet meta tags, Schema.org JSON-LD structured data, and sitemaps.

### Phase 5A: Driver Web App & Automated Dispatch
- **Mobile-First Driver PWA**: Progressive Web App at `/driver` with app manifest and service worker shell caching.
- **Automated Driver Dispatch**: 2dsphere location matching (`$near`) pairing nearest available drivers with pending ride requests.
- **Offer Queue & Countdown**: Sequential 30-second offer countdown timers with fallback retries.
- **Ride Lifecycle**: Strict state machine validation (`assigned` ➔ `on_the_way` ➔ `arrived` ➔ `in_progress` [4-digit OTP check] ➔ `completed`).

### Phase 5B: Live Location Tracking & ETA
- **Socket.IO Real-Time Engine**: Authenticated WebSockets for drivers, admins, and unguessable customer tracking tokens (`/track/:trackingToken`).
- **Interactive Live Map**: Leaflet & OpenStreetMap rendering of real-time vehicle movement, pickup/drop pins, and route polyline trails.
- **Dynamic ETA**: Automatic arrival time estimation throttled to prevent API overloads.
- **Admin Fleet Operations Map**: Unified city-wide fleet dashboard (`/admin/live-map`) showing all online drivers in real-time.

---

## 🔒 Driver PWA Background Location Tracking Limits

Web browsers and PWA platforms impose OS-level restrictions on background geolocation tracking:

1. **iOS Safari Limits**: Safari suspends background JavaScript timers and HTML5 geolocation when the device screen is locked or the browser is minimized.
2. **Android Chrome Limits**: Chrome throttles background location updates when the app is minimized to conserve battery.
3. **Screen Wake Lock API**: To maintain continuous GPS streaming while driving, the Driver App integrates `navigator.wakeLock.request('screen')`, keeping the screen illuminated during active trips.
4. **Privacy Guarantee**: Driver GPS location is transmitted **only** while the driver is `ONLINE` or on an active trip. Location transmission halts immediately upon switching to `OFFLINE`.
5. **Data Retention**: Route trail breadcrumbs are stored for 30 days and automatically purged by an automated background cleanup cron job.

---

## 🛠 Setup & Local Development

### 1. Backend Server
```bash
cd server
npm install
npm run dev
```

### 2. Frontend Client
```bash
cd client
npm install
npm run dev
```

- **Public App**: `http://localhost:5173`
- **Customer Account**: `http://localhost:5173/account`
- **Driver PWA App**: `http://localhost:5173/driver`
- **Admin Console**: `http://localhost:5173/admin`
- **Admin Live Fleet Map**: `http://localhost:5173/admin/live-map`