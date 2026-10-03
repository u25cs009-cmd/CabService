# Cab Service Website: Implementation Plan

## 1. Project Overview

**Goal:** Build a website where customers can view cab services, get a fare estimate, and book a ride. The owner can receive and manage bookings.

**Approach:** Build in phases. Each phase produces a working, deployable product, so you can launch early and improve over time.

| Phase | Outcome | Complexity |
|-------|---------|------------|
| 1 | Static website with booking request form (WhatsApp/email) | Low |
| 2 | Backend + database to store bookings | Medium |
| 3 | Admin panel to manage bookings, vehicles, drivers | Medium |
| 4 | Fare calculator with maps, online payment, customer accounts | Medium-High |
| 5 | Driver app, live tracking, notifications | High |

---

## 2. Requirements

### 2.1 Functional Requirements
- Customer can view services (local, outstation, airport, hourly rental).
- Customer can view vehicle types with capacity and rates.
- Customer can submit a booking: name, phone, pickup, drop, date, time, vehicle type, passengers, notes.
- Customer gets a fare estimate before booking.
- Customer receives booking confirmation (WhatsApp / SMS / email).
- Owner/admin can view, confirm, assign, and cancel bookings.
- Owner/admin can manage vehicles, drivers, and fare rates.
- Customer can pay online (later phase).

### 2.2 Non-Functional Requirements
- Mobile-first, responsive design (most users book on phones).
- Fast loading (under 3 seconds on mobile data).
- Secure: HTTPS, input validation, no secrets in the repo.
- SEO-friendly so customers can find the site on Google.
- Easy to maintain and extend.

---

## 3. Tech Stack

### Phase 1 (Static)
- **Frontend:** HTML5, CSS3, vanilla JavaScript
- **Form handling:** WhatsApp click-to-chat link, or Formspree / EmailJS
- **Hosting:** GitHub Pages, Netlify, or Vercel

### Phase 2 onwards (Full-stack)
- **Frontend:** Keep vanilla JS, or move to React/Next.js if the UI grows
- **Backend:** Node.js + Express (or Python Flask/Django)
- **Database:** PostgreSQL, or MongoDB (MongoDB Atlas has a free tier)
- **Auth:** JWT or session-based login
- **Maps and distance:** Google Maps API (Places, Distance Matrix) or OpenStreetMap-based alternatives
- **Payments:** Razorpay (supports UPI, cards, netbanking)
- **Notifications:** WhatsApp Business API, SMS gateway, or email via Nodemailer
- **Hosting:** Render, Railway, or a VPS for the backend

---

## 4. Project Structure

```
cab-service/
├── public/
│   ├── index.html
│   ├── services.html
│   ├── vehicles.html
│   ├── book.html
│   ├── about.html
│   ├── contact.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js
│   │   ├── booking.js
│   │   └── fare.js
│   └── images/
├── server/                  # Phase 2+
│   ├── index.js
│   ├── routes/
│   │   ├── bookings.js
│   │   ├── vehicles.js
│   │   └── auth.js
│   ├── models/
│   ├── middleware/
│   └── config/
├── admin/                   # Phase 3
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 5. Phase 1: Static Website (Week 1)

### Tasks
1. **Setup**
   - Open the cloned repo in Antigravity as the workspace.
   - Create the folder structure, `.gitignore`, and `README.md`.
   - Commit: `Initial project structure`.
2. **Design basics**
   - Choose brand name, logo, color palette (2 main colors + 1 accent), and fonts.
   - Keep the layout clean: large buttons, readable text, strong call-to-action.
3. **Pages and sections**
   - **Home:** hero with "Book a Cab" button, services summary, why choose us, testimonials, contact strip.
   - **Services:** local, outstation, airport transfer, hourly rental, tour packages.
   - **Vehicles and fares:** cards with photo, seats, luggage capacity, rate per km, minimum fare.
   - **Book:** booking form.
   - **About and Contact:** story, phone, WhatsApp, email, address, embedded map.
   - **Footer:** links, social media, terms.
4. **Booking form**
   - Fields: name, phone, email (optional), pickup, drop, date, time, vehicle type, passengers, notes.
   - Client-side validation: required fields, 10-digit phone, date not in the past.
   - On submit: open WhatsApp with a pre-filled message, or send via Formspree/EmailJS.
5. **Floating buttons:** Call and WhatsApp buttons fixed on mobile.
6. **Testing and polish**
   - Test on Chrome, Safari, and real phones.
   - Run Lighthouse for performance and accessibility.
7. **Deploy**
   - Deploy to Netlify/GitHub Pages and connect a custom domain with HTTPS.

### Deliverable
A live website that sends booking requests to the owner via WhatsApp or email.

---

## 6. Phase 2: Backend and Database (Weeks 2-3)

### Tasks
1. Initialize the Node.js project (`npm init`), install Express, dotenv, cors, and a database driver.
2. Create `.env` for secrets (database URL, API keys). Add `.env` to `.gitignore`.
3. Design the database.

### Database Schema

**bookings**
| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| customer_name | text | |
| phone | text | |
| email | text | optional |
| pickup_location | text | |
| drop_location | text | |
| pickup_datetime | timestamp | |
| trip_type | enum | local, outstation, airport, hourly |
| vehicle_id | FK | |
| passengers | int | |
| estimated_fare | decimal | |
| status | enum | pending, confirmed, assigned, completed, cancelled |
| driver_id | FK | nullable |
| notes | text | |
| created_at | timestamp | |

**vehicles:** id, name, type, seats, luggage_capacity, rate_per_km, base_fare, image_url, is_active

**drivers:** id, name, phone, license_no, vehicle_number, status

**users (admin and customers):** id, name, email, phone, password_hash, role

### API Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/bookings | Create booking |
| GET | /api/bookings/:id | Get booking status |
| GET | /api/vehicles | List vehicles and rates |
| POST | /api/fare/estimate | Calculate fare |
| POST | /api/auth/login | Admin login |
| GET | /api/admin/bookings | List all bookings (protected) |
| PATCH | /api/admin/bookings/:id | Update status/assign driver (protected) |

4. Add server-side validation (never trust only client-side checks).
5. Add rate limiting and basic security headers (`helmet`, `express-rate-limit`).
6. Connect the booking form to `POST /api/bookings`.
7. Send the owner a notification (email or WhatsApp) when a booking arrives.
8. Deploy the backend to Render/Railway and connect the frontend to it.

### Deliverable
Bookings are saved in a database and the owner is notified automatically.

---

## 7. Phase 3: Admin Panel (Weeks 3-4)

### Tasks
1. Secure admin login (hashed passwords with bcrypt, JWT tokens, logout).
2. **Dashboard:** today's bookings, pending count, revenue summary.
3. **Bookings management:** table with search, filter by status/date, view details, confirm, cancel, assign driver.
4. **Vehicle management:** add, edit, deactivate vehicles; update rates.
5. **Driver management:** add, edit drivers; mark available/unavailable.
6. **Export:** download bookings as CSV.
7. Send the customer a status update when a booking is confirmed or a driver is assigned.

### Deliverable
The owner can run daily operations without touching code or the database.

---

## 8. Phase 4: Smart Features (Weeks 5-6)

1. **Maps integration**
   - Location autocomplete for pickup and drop.
   - Calculate distance and duration automatically.
2. **Fare calculator**
   - Formula: `fare = max(base_fare, distance_km × rate_per_km) + night_charge + toll/parking + tax`.
   - Different rules for local (package-based), outstation (per km with daily minimum), and airport (fixed).
   - Show the estimate before the customer confirms.
3. **Online payment**
   - Integrate Razorpay: advance payment or full payment.
   - Verify payments on the server using webhooks; store payment status.
4. **Customer accounts:** sign up, login, booking history, repeat booking.
5. **Coupons and offers:** discount codes.
6. **Reviews:** customers rate completed trips.
7. **SEO:** meta tags, sitemap, structured data, Google Business Profile.

---

## 9. Phase 5: Advanced (Later)

- Driver mobile app or driver web view to accept trips.
- Live location tracking and ETA.
- Automatic driver assignment by proximity.
- Push notifications and SMS/WhatsApp automation.
- Corporate accounts and monthly invoicing.
- Analytics dashboard and reports.

---

## 10. Security Checklist

- [ ] HTTPS everywhere
- [ ] Secrets only in environment variables, never in git
- [ ] Passwords hashed (bcrypt)
- [ ] Input validation and sanitization on the server
- [ ] Rate limiting on booking and login endpoints
- [ ] Admin routes protected by authentication and role checks
- [ ] CORS limited to your own domain
- [ ] Payment verification done server-side
- [ ] Regular database backups
- [ ] Privacy policy and terms page (you store customer phone numbers)

---

## 11. Testing Plan

| Type | What to check |
|------|---------------|
| Functional | Form validation, booking creation, status updates, fare results |
| Responsive | Phones (small and large), tablets, desktop |
| Cross-browser | Chrome, Safari, Firefox, Edge |
| Performance | Lighthouse score 90+, compressed images |
| Security | Try invalid input, unauthorized access to admin routes |
| Payments | Test mode transactions: success, failure, cancel |
| User testing | Ask 3-5 real people to book a cab and note where they get stuck |

---

## 12. Git Workflow

- `main`: always stable and deployable.
- Create a branch per feature: `feature/booking-form`, `feature/admin-panel`.
- Make small commits with clear messages (`Add fare calculator`).
- Merge to `main` only after testing.
- Tag releases: `v1.0` (static site), `v2.0` (backend), and so on.

---

## 13. Working with Antigravity (AI Agent)

1. Give one focused task per prompt (e.g., "Build the booking form with validation").
2. Ask for a plan first and review it before code is written.
3. Run and test after every change; describe bugs in plain language.
4. Read the changes the agent made before committing.
5. Never paste real passwords or API keys into prompts.
6. Commit after each working feature so you can roll back easily.

---

## 14. Launch Checklist

- [ ] Business name, logo, and contact details final
- [ ] Fares and vehicle details verified
- [ ] All forms tested end to end
- [ ] Mobile layout checked on real devices
- [ ] Custom domain and HTTPS working
- [ ] Google Business Profile created
- [ ] Privacy policy and terms published
- [ ] Owner notification tested (WhatsApp/email)
- [ ] Backup and monitoring in place

---

## 15. Timeline Summary

| Week | Focus |
|------|-------|
| 1 | Phase 1: static site, booking form, deployment |
| 2-3 | Phase 2: backend, database, notifications |
| 3-4 | Phase 3: admin panel |
| 5-6 | Phase 4: maps, fare calculator, payments, accounts |
| 7+ | Phase 5: driver app and advanced features |

*Timelines are estimates for one person working part-time with AI assistance; adjust as needed.*

---

## 16. Estimated Costs (Typical)

| Item | Cost |
|------|------|
| Domain name | Low yearly fee |
| Static hosting (Netlify/GitHub Pages) | Free |
| Backend hosting (Render/Railway) | Free tier to low monthly fee |
| Database (MongoDB Atlas / Supabase) | Free tier to low monthly fee |
| Google Maps API | Free monthly credit, then pay per use |
| Payment gateway | Per-transaction percentage |
| WhatsApp Business API / SMS | Per-message charges |

---

## 17. Next Immediate Steps

1. Finalize business name, services, vehicles, and fares.
2. Run the Phase 1 prompt in Antigravity and review the plan it produces.
3. Test the booking form and commit.
4. Deploy and share the link with a few people for feedback.
