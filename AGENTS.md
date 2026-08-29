# MeriJodi Full-Stack Platform

A matrimonial match-making platform built with Express.js, MongoDB/Mongoose, Dual-Token JWT Auth with Redis caching, Nodemailer, Cloudinary media storage, Google OAuth, Gemini & Groq AI Biodata extraction, and Socket.io real-time chat.

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 4.x
- **Database:** MongoDB with Mongoose 8.x
- **Cache & TTL:** Redis (with resilient in-memory TTL store fallback)
- **Auth:** Dual JWT Token Rotation (15m Access Token + 7d Refresh Token in Redis) + HTTP-only cookies + Google OAuth
- **Email:** Nodemailer with branded responsive HTML templates
- **File Upload & Media:** Multer + Cloudinary
- **AI Extraction:** Google Gemini 2.5 Flash & Groq LLM fallback for automated Biodata parsing
- **Real-Time:** Socket.io for messaging, typing indicators, read receipts, and live notifications
- **Validation:** express-validator & Zod
- **Security:** Helmet, CORS, mongo-sanitize, rate-limiting, compression

## Folder Structure

```
Backend/
├── server.js                     # HTTP & Socket.io server entry point
├── package.json
├── .env                          # Environment variables (gitignored)
├── .env.sample                   # Environment variables template
└── src/
    ├── app.js                    # Express app configuration & middleware pipeline
    ├── socket.js                 # Socket.io event handlers & real-time messaging
    ├── config/
    │   ├── config.js             # Environment configuration with required checks
    │   ├── db.js                 # MongoDB connection manager
    │   ├── redis.js              # Redis client with in-memory TTL fallback
    │   ├── sendMail.js           # Nodemailer transport with dev simulation
    │   ├── html.js               # Responsive HTML email templates
    │   ├── generateToken.js      # JWT token generator, rotator, and revoker
    │   ├── zod.js                # Zod request validation schemas
    │   └── cloudinary.js         # Cloudinary SDK setup
    ├── constants/
    │   └── index.js              # Enums (GENDER, MARITAL_STATUS, etc.)
    ├── controllers/
    │   ├── base.controller.js    # Base controller with standard API responses
    │   ├── auth.controller.js    # Auth endpoints (register, verify, login, refresh, google, logout)
    │   ├── profile.controller.js # Profile management
    │   ├── partnerPreference.controller.js
    │   ├── interest.controller.js
    │   ├── message.controller.js
    │   ├── shortlist.controller.js
    │   ├── block.controller.js
    │   ├── report.controller.js
    │   ├── notification.controller.js
    │   ├── verification.controller.js
    │   ├── matching.controller.js
    │   ├── photo.controller.js
    │   └── extraction.controller.js
    ├── middlewares/
    │   ├── auth.js               # JWT auth verification, attachUser, requireAdmin
    │   ├── sanitize.js           # mongo-sanitize middleware
    │   ├── validate.js           # express-validator wrapper
    │   ├── upload.js             # Multer + Cloudinary storage
    │   ├── security.js           # Helmet, CORS, body parsers
    │   ├── logger.js             # Morgan HTTP logging
    │   └── errorHandler.js       # Global error handler
    ├── models/
    │   ├── User.js               # Core user credentials & status
    │   ├── Profile.js            # Matrimonial profile & preferences
    │   ├── PartnerPreference.js  # Ideal match criteria
    │   ├── Interest.js           # Match connection requests & status
    │   ├── Message.js            # Direct chat messages
    │   ├── Shortlist.js          # Bookmarked match profiles
    │   ├── Block.js              # User block list
    │   ├── Report.js             # User safety and abuse reports
    │   ├── Notification.js       # Real-time and push notifications
    │   └── Verification.js       # Document verification requests
    ├── routes/
    │   ├── index.js              # Route aggregator with singular/plural aliases
    │   ├── auth.routes.js        # Auth routes (/api/auth)
    │   ├── profile.routes.js
    │   ├── partnerPreference.routes.js
    │   ├── interest.routes.js
    │   ├── message.routes.js
    │   ├── shortlist.routes.js
    │   ├── block.routes.js
    │   ├── report.routes.js
    │   ├── notification.routes.js
    │   ├── verification.routes.js
    │   ├── matching.routes.js
    │   ├── photo.routes.js
    │   └── extraction.routes.js
    └── services/
        ├── auth.service.js       # Auth logic, Redis session caching, Google OAuth
        ├── profile.service.js    # Profile CRUD & completion score
        ├── partnerPreference.service.js
        ├── interest.service.js
        ├── message.service.js
        ├── shortlist.service.js
        ├── block.service.js
        ├── report.service.js
        ├── notification.service.js
        ├── verification.service.js
        ├── matching.service.js
        ├── photo.service.js
        └── extraction.service.js
```

## Authentication Flow

1. **Registration:**
   - `POST /api/auth/register` validates input with Zod.
   - Hashes password with bcrypt.
   - Stores pending registration data in Redis with a 5-minute TTL.
   - Sends branded verification email with a secure token link.
2. **Email Verification:**
   - `POST /api/auth/verify/:token` reads registration data from Redis.
   - Creates `User` and initial `Profile` in MongoDB.
   - Issues Dual JWT tokens (15m Access Token + 7d Refresh Token in Redis).
3. **Login (Two-Factor Email OTP):**
   - `POST /api/auth/login` verifies user email and bcrypt password.
   - Generates a 6-digit OTP stored in Redis (5-minute TTL).
   - Dispatches OTP to the user's verified email.
   - `POST /api/auth/verify` validates the OTP and issues fresh JWT access/refresh tokens.
4. **Token Rotation & Refresh:**
   - `POST /api/auth/refresh` verifies the Refresh Token against Redis and issues a fresh 15-minute Access Token.
5. **Google OAuth:**
   - `POST /api/auth/google` accepts Google credentials/token, verifies with Google, and signs in or creates the user.
6. **Logout:**
   - `POST /api/auth/logout` clears HTTP-only cookies and revokes the Refresh Token in Redis.

## API Conventions

- All main API routes under `/api/v1` (with `/api/auth` for authentication)
- Protected routes require Bearer JWT token in Authorization header or HTTP-only cookies
- Responses use standard format: `{ success: true, message: "...", data: { ... } }`
- Errors return standard format: `{ success: false, message: "..." }`
- Pagination support: `?page=1&limit=20`

## Environment Variables

```env
PORT=5000
DB_URI=mongodb://localhost:27017/meri
NODE_ENV=development
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
FRONTEND_DOMAIN=http://localhost:5173

# Redis (optional, falls back to in-memory store)
REDIS_URL=redis://127.0.0.1:6379

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Biodata Extraction
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
```

## Running & Testing

```bash
# Backend
cd Backend
npm install
npm run dev

# Run Backend Tests
node scripts/test-auth-api.js
node scripts/test-fullstack-features.js

# Frontend
cd ../Frontend
npm install
npm run dev
npm run build
```
