# 🚀 Production Deployment & Operations Guide
## Pi-Pip-Pip Cab Service

This document provides step-by-step instructions for deploying, configuring, securing, and maintaining the **Pi-Pip-Pip Cab Service** in production.

---

## 📋 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Database Setup (MongoDB Atlas)](#2-database-setup-mongodb-atlas)
3. [Backend Deployment (Render / Railway)](#3-backend-deployment-render--railway)
4. [Frontend Deployment (Vercel / Netlify)](#4-frontend-deployment-vercel--netlify)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Domain Name & HTTPS Setup](#6-domain-name--https-setup)
7. [Third-Party Integrations & Key Restrictions](#7-third-party-integrations--key-restrictions)
8. [First-Time Admin Setup & Seeding](#8-first-time-admin-setup--seeding)
9. [MongoDB Atlas Backup & Restore](#9-mongodb-atlas-backup--restore)
10. [Rollback Strategy](#10-rollback-strategy)
11. [Post-Deployment Checklist](#11-post-deployment-checklist)
12. [Troubleshooting Guide](#12-troubleshooting-guide)

---

## 1. Architecture Overview
* **Frontend**: React + Vite SPA (Hosted on Vercel or Netlify).
* **Backend**: Node.js + Express + Socket.IO (Hosted on Render or Railway).
* **Database**: MongoDB Atlas (Managed Cloud Database Cluster).
* **Payment Gateway**: Razorpay (Live API Keys + Webhooks).
* **Maps & Geolocation**: Google Maps JavaScript API & Distance Matrix API.
* **Notifications**: Nodemailer SMTP, Meta WhatsApp Cloud API, SMS Gateway.

---

## 2. Database Setup (MongoDB Atlas)

1. **Create Cluster**:
   * Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   * Create a new M0 (Free) or M10+ cluster in your preferred region (e.g. `ap-south-1` Mumbai or `ap-southeast-1` Singapore).

2. **Network Access (IP Access List)**:
   * Navigate to **Network Access** under Security.
   * Add IP address:
     * For production web hosts with dynamic IPs (Render/Vercel/Railway), add `0.0.0.0/0` (Allow Access from Anywhere) or restrict via NAT Gateway IPs if using dedicated hosting.

3. **Database Access (User Credentials)**:
   * Navigate to **Database Access**.
   * Click **Add New Database User**.
   * Select **Password** authentication.
   * User privileges: `Read and write to any database`.
   * Save password securely.

4. **Get Connection String**:
   * Click **Connect** -> **Drivers** -> Node.js.
   * Copy connection URI format:
     ```text
     mongodb+srv://<username>:<password>@cluster0.mongodb.net/pipippip_cabs?retryWrites=true&w=majority
     ```

---

## 3. Backend Deployment (Render / Railway)

### Option A: Render Deployment (Recommended via `render.yaml`)

1. Push your repository to GitHub.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Connect your GitHub repository. Render will automatically detect `render.yaml`.
5. Enter values for required environment variables:
   * `MONGODB_URI`
   * `CLIENT_URL` (e.g. `https://pipippipcabs.com`)
   * `JWT_SECRET` (Must be at least 32 random characters)
   * `EMAIL_USER`, `EMAIL_PASS`, `OWNER_EMAIL`
   * `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
6. Click **Apply**.

### Option B: Manual Web Service Setup (Render)
* **Root Directory**: `server`
* **Build Command**: `npm install`
* **Start Command**: `npm start`
* **Health Check Path**: `/health`

---

## 4. Frontend Deployment (Vercel / Netlify)

### Option A: Vercel Deployment

1. Log into [Vercel Dashboard](https://vercel.com).
2. Import your GitHub repository.
3. Set **Framework Preset** to `Vite`.
4. Set **Root Directory** to `client`.
5. Add Environment Variables under **Settings -> Environment Variables**:
   * `VITE_API_URL`: `https://your-backend-api.onrender.com/api`
   * `VITE_GOOGLE_MAPS_KEY`: Your Google Maps Browser API Key
   * `VITE_RAZORPAY_KEY_ID`: Your Razorpay Key ID
6. Click **Deploy**. Vercel will automatically parse `client/vercel.json` for SPA routes and security headers.

### Option B: Netlify Deployment

1. Log into [Netlify Dashboard](https://app.netlify.com).
2. Select **Add new site** -> **Import an existing project**.
3. Set **Base directory** to `client`.
4. Set **Build command** to `npm run build`.
5. Set **Publish directory** to `client/dist`.
6. Configure environment variables (`VITE_API_URL`, `VITE_GOOGLE_MAPS_KEY`, `VITE_RAZORPAY_KEY_ID`).
7. Deploy. `client/public/_redirects` and `client/public/_headers` will ensure SPA routes and security headers work seamlessly.

---

## 5. Environment Variables Reference

### Backend (`server/.env`)
| Variable | Required | Production Description / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | Yes | `5000` or host assigned port |
| `MONGODB_URI` | Yes | `mongodb+srv://admin:PASS@cluster.mongodb.net/pipippip_cabs` |
| `JWT_SECRET` | Yes | Strong random key (minimum 32 characters) |
| `CLIENT_URL` | Yes | `https://pipippipcabs.com` (Frontend URL) |
| `CUSTOM_DOMAIN` | Optional | `https://www.pipippipcabs.com` |
| `GOOGLE_MAPS_SERVER_KEY` | Optional | Server API Key for Distance Matrix API |
| `EMAIL_USER` | Optional | SMTP username / Gmail address |
| `EMAIL_PASS` | Optional | Gmail App Password (16 characters) |
| `OWNER_EMAIL` | Optional | Business owner alert recipient email |
| `RAZORPAY_KEY_ID` | Optional | Razorpay Live Key ID (`rzp_live_...`) |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay Live Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Webhook signing secret from Razorpay dashboard |
| `ADMIN_EMAIL` | Temporary | Initial admin email for `npm run seed` |
| `ADMIN_PASSWORD` | Temporary | Initial admin password for `npm run seed` |

### Frontend (`client/.env`)
| Variable | Required | Production Description / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Yes | `https://api.pipippipcabs.com/api` |
| `VITE_GOOGLE_MAPS_KEY` | Optional | Google Maps Browser API Key |
| `VITE_RAZORPAY_KEY_ID` | Optional | Razorpay Live Key ID |

---

## 6. Domain Name & HTTPS Setup

1. **Backend Custom Domain**:
   * In Render / Railway, add custom domain `api.pipippipcabs.com`.
   * Add a `CNAME` record in your DNS provider (Cloudflare, GoDaddy, Namecheap):
     * Name: `api`
     * Target: `<your-render-app>.onrender.com`

2. **Frontend Custom Domain**:
   * In Vercel / Netlify, add custom domain `pipippipcabs.com` and `www.pipippipcabs.com`.
   * Add DNS records:
     * `A` record `@` -> `76.76.21.21` (for Vercel) or `75.2.60.5` (for Netlify).
     * `CNAME` `www` -> `cname.vercel-dns.com` or Netlify endpoint.

3. **HTTPS Verification**:
   * SSL/TLS certificates will be issued automatically via Let's Encrypt by Vercel/Netlify/Render. Verify that `https://` is active on all endpoints.

---

## 7. Third-Party Integrations & Key Restrictions

### A. Razorpay Webhook Registration
* Log into [Razorpay Dashboard](https://dashboard.razorpay.com).
* Navigate to **Settings -> Webhooks -> Add New Webhook**.
* **Webhook URL**: `https://api.pipippipcabs.com/api/payments/webhook`
* **Secret**: Generate a strong secret and save in server `.env` as `RAZORPAY_WEBHOOK_SECRET`.
* **Active Events to Select**:
  * `payment.captured`
  * `payment.failed`
  * `refund.processed`

### B. Google Maps Key Restrictions (Crucial for Security)
1. **Client Browser Key (`VITE_GOOGLE_MAPS_KEY`)**:
   * In [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials):
   * Select **Application Restrictions** -> **HTTP referrers (web sites)**.
   * Add allowed website referrers:
     * `https://pipippipcabs.com/*`
     * `https://www.pipippipcabs.com/*`
     * `https://*.vercel.app/*`
     * `https://*.netlify.app/*`
   * Under **API Restrictions**, restrict to: `Maps JavaScript API`, `Places API`.

2. **Server API Key (`GOOGLE_MAPS_SERVER_KEY`)**:
   * Under **Application Restrictions**, select **IP addresses** (add backend host IPs) or **None** if host IP is dynamic.
   * Under **API Restrictions**, restrict strictly to: `Distance Matrix API`, `Directions API`, `Geocoding API`.

---

## 8. First-Time Admin Setup & Seeding

1. **Set Environment Variables on Backend Host**:
   * Set `ADMIN_EMAIL="admin@pipippipcabs.com"`
   * Set `ADMIN_PASSWORD="YourSuperSecureAdminPassword123!"`

2. **Execute Seed Script**:
   * Run via Render Shell / Railway CLI / SSH:
     ```bash
     cd server
     npm run seed
     ```
   * Output will confirm:
     ```text
     [Seed] Vehicles: 4 initial vehicle(s) inserted. Existing vehicles preserved.
     [Seed] Successfully created initial admin account: admin@pipippipcabs.com
     [Seed] Drivers: 2 sample driver(s) inserted. Existing drivers preserved.
     ```

3. **Post-Seed Security Cleanup**:
   * Immediately remove `ADMIN_PASSWORD` from your hosting platform environment variables so it cannot be viewed or leaked.

---

## 9. MongoDB Atlas Backup & Restore

### Automated Continuous Backups (Recommended)
* MongoDB Atlas automatically maintains continuous snapshots on M10+ tiers.
* Access via Atlas Console: **Database -> Backup -> Snapshots**.

### Manual Command-Line Backup (`mongodump`)
```bash
mongodump --uri="mongodb+srv://<username>:<password>@cluster0.mongodb.net/pipippip_cabs" --out=./backup_$(date +%F)
```

### Manual Command-Line Restore (`mongorestore`)
```bash
mongorestore --uri="mongodb+srv://<username>:<password>@cluster0.mongodb.net/pipippip_cabs" --drop ./backup_2026-10-04/pipippip_cabs
```

---

## 10. Rollback Strategy

If a deployment causes errors or regressions:
1. **Frontend Rollback (Vercel / Netlify)**:
   * Open Dashboard -> **Deployments**.
   * Locate previous stable build -> Click `Promote to Production` / `Rollback`. (Instant ~5 seconds).
2. **Backend Rollback (Render / Railway)**:
   * Open Dashboard -> **Events / Deploys**.
   * Click **Rollback to this deploy**.
3. **Database Rollback**:
   * Restore Atlas snapshot from prior to the release window.

---

## 11. Post-Deployment Checklist

- [ ] **Health Endpoint**: Test `GET https://api.pipippipcabs.com/health` returns `{"status":"ok","database":"connected"}`.
- [ ] **SSL / HTTPS**: Verify SSL locks on frontend and backend domain URLs.
- [ ] **Admin Login**: Log into `https://pipippipcabs.com/admin/login` using admin credentials.
- [ ] **Driver Login**: Log into `https://pipippipcabs.com/driver/login` using driver credentials.
- [ ] **Booking Flow**: Place a test booking on the homepage and verify reference code generation.
- [ ] **Payment Gateway**: Perform a test payment (or ₹1 live payment) via Razorpay.
- [ ] **Webhooks**: Check server logs to ensure Razorpay `payment.captured` webhook signature is verified.
- [ ] **Live GPS Tracking**: Verify Socket.IO updates on `/track/:token` and live admin map.
- [ ] **SEO Check**: Verify search engines do NOT index `/admin` or `/driver` routes (checked via `robots.txt` and meta `noindex`).
- [ ] **Privacy & Terms**: Confirm footer links to `/privacy` and `/terms` render properly.

---

## 12. Troubleshooting Guide

### Issue 1: CORS Error in Browser Console (`CORS Policy: Origin not allowed`)
* **Cause**: `CLIENT_URL` in server `.env` does not match the exact origin sending the request (including `https://` vs `http://` or trailing slashes).
* **Fix**: Update `CLIENT_URL` on Render/Railway to match your exact frontend domain: `CLIENT_URL=https://pipippipcabs.com`.

### Issue 2: 404 Not Found on Route Refresh (`/book`, `/admin`, `/driver`)
* **Cause**: Hosting server attempting to locate a static file matching the route path instead of serving `index.html`.
* **Fix**: Ensure `client/public/_redirects` (Netlify) or `client/vercel.json` (Vercel) is present in the build bundle.

### Issue 3: Cold Starts / Slow First Request on Free Tiers
* **Cause**: Free hosting tiers (like Render free instances) spin down after 15 minutes of inactivity.
* **Fix**: Upgrade to Render Starter ($7/mo) or use an external ping tool (like UptimeRobot) to send a heartbeat request to `https://api.pipippipcabs.com/health` every 5 minutes.

### Issue 4: Razorpay Webhook Signature Verification Failure
* **Cause**: Incorrect `RAZORPAY_WEBHOOK_SECRET` or raw request body modified by middleware before signature calculation.
* **Fix**: Ensure `RAZORPAY_WEBHOOK_SECRET` in `.env` matches the Razorpay dashboard webhook configuration exactly. `app.js` captures raw body buffer via `express.json({ verify: (req, res, buf) => { req.rawBody = buf; } })`.

### Issue 5: Email Notifications Not Sending
* **Cause**: Gmail blocking SMTP authentication due to missing App Password or 2FA.
* **Fix**: Generate a 16-character Gmail App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords). Set `EMAIL_USER=yourgmail@gmail.com` and `EMAIL_PASS=your16charapppass`.
