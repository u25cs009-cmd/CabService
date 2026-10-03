# Pi-Pip-Pip Cab Service API Server

Backend REST API server built with Node.js, Express, MongoDB (Mongoose), JWT, Zod, and Nodemailer for the Pi-Pip-Pip Cab Service.

---

## 🚀 Environment Variables (`server/.env`)

Copy `.env.example` to `.env` and adjust the variables:

| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| `PORT` | HTTP Server Port | `5000` |
| `MONGODB_URI` | MongoDB Connection String | `mongodb://127.0.0.1:27017/pipippip_cabs` |
| `JWT_SECRET` | Secret key for Admin JWT signing | `your_secret_key` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |
| `EMAIL_USER` | SMTP Sender Email | `yashiadarsh2020@gmail.com` |
| `EMAIL_PASS` | SMTP App Password | `your_app_password` |
| `OWNER_EMAIL` | Destination Email for new bookings | `yashiadarsh2020@gmail.com` |
| `ADMIN_EMAIL` | Initial Admin Email | `admin@pipippip.com` |
| `ADMIN_PASSWORD` | Initial Admin Password | `AdminSecurePassword123!` |

---

## 📦 Setup & Commands

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Seed Database (Vehicles & Admin Account):**
   ```bash
   npm run seed
   ```

3. **Start Development Server (with nodemon):**
   ```bash
   npm run dev
   ```

4. **Start Production Server:**
   ```bash
   npm start
   ```

---

## 📡 API Endpoints

### Public Endpoints
- `GET /api/health` - System health check.
- `GET /api/vehicles` - Fetch active cab fleet with seat capacity, luggage space, and per-km rates.
- `POST /api/fare/estimate` - Calculate estimated fare based on trip distance in KM and vehicle type.
- `POST /api/bookings` - Submit a new cab booking (returns unique reference code e.g. `PPP-A8F2K9` and notifies owner email).
- `GET /api/bookings/:reference` - Public booking status check by reference code.

### Auth & Admin Endpoints
- `POST /api/auth/login` - Admin login (returns JWT token).
- `GET /api/admin/bookings` *(Protected, Admin)* - Paginated booking list with status & search filters.
- `PATCH /api/admin/bookings/:id` *(Protected, Admin)* - Update booking status and assign driver.
