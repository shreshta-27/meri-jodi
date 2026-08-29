# MeriJodi Backend

A matrimony platform backend built with Express.js, Mongoose, and Clerk authentication.

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 4.x
- **Database:** MongoDB with Mongoose 8.x
- **Auth:** Clerk (`@clerk/express`)
- **Validation:** express-validator
- **File Upload:** Multer + Cloudinary
- **Security:** Helmet, CORS, compression

## Folder Structure

```
Backend/
├── server.js                     # Entry point
├── package.json
├── .env.sample                   # Environment variables template
└── src/
    ├── app.js                    # Express app configuration
    ├── config/
    │   ├── config.js             # Environment config
    │   ├── db.js                 # MongoDB connection
    │   └── cloudinary.js         # Cloudinary setup
    ├── constants/
    │   └── index.js              # All enums and constants
    ├── controllers/
    │   ├── base.controller.js    # Base class with sendSuccess/sendError
    │   ├── home.controller.js    # Root route
    │   ├── profile.controller.js
    │   ├── partnerPreference.controller.js
    │   ├── interest.controller.js
    │   ├── message.controller.js
    │   ├── shortlist.controller.js
    │   ├── block.controller.js
    │   ├── report.controller.js
    │   ├── notification.controller.js
    │   ├── verification.controller.js
    │   ├── matching.controller.js
    │   └── photo.controller.js
    ├── middlewares/
    │   ├── auth.js               # Clerk auth (authenticate, requireAuth, attachUser, requireAdmin)
    │   ├── validate.js           # express-validator wrapper
    │   ├── upload.js             # Multer + Cloudinary storage
    │   ├── security.js           # Helmet, CORS, parsers
    │   ├── logger.js             # Morgan
    │   └── errorHandler.js       # Global error handler
    ├── models/
    │   ├── User.js               # Clerk-linked user
    │   ├── Profile.js            # Matrimonial profile
    │   ├── PartnerPreference.js
    │   ├── Interest.js
    │   ├── Message.js
    │   ├── Shortlist.js
    │   ├── Block.js
    │   ├── Report.js
    │   ├── Notification.js
    │   └── Verification.js
    ├── routes/
    │   ├── index.js              # Route aggregator
    │   ├── health.routes.js
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
    │   └── webhook.routes.js
    ├── services/
    │   ├── profile.service.js
    │   ├── partnerPreference.service.js
    │   ├── interest.service.js
    │   ├── message.service.js
    │   ├── shortlist.service.js
    │   ├── block.service.js
    │   ├── report.service.js
    │   ├── notification.service.js
    │   ├── verification.service.js
    │   ├── matching.service.js
    │   ├── photo.service.js
    │   └── webhook.service.js
    ├── utils/
    │   └── ApiResponse.js
    └── validators/
        ├── profile.validator.js
        ├── partnerPreference.validator.js
        ├── message.validator.js
        ├── interest.validator.js
        ├── shortlist.validator.js
        ├── block.validator.js
        ├── report.validator.js
        └── verification.validator.js
```

## Auth Flow

1. User signs up/in via Clerk (frontend)
2. Clerk issues session JWT
3. Backend `authenticate` middleware (Clerk's `clerkMiddleware()`) validates JWT
4. `requireAuth` blocks unauthenticated requests
5. `attachUser` fetches MongoDB User document via `clerkId`
6. `requireAdmin` checks role for admin-only routes

### Webhook Sync

- `POST /api/webhooks/clerk` receives `user.created`, `user.updated`, `user.deleted`
- Creates/updates/deletes User + Profile in MongoDB

## API Conventions

- All routes under `/api`
- Protected routes require Clerk JWT
- Request body validated with express-validator
- Responses use `ApiResponse` format: `{ success, message, data }`
- Errors: `{ success: false, message }`
- Pagination: `?page=1&limit=20`

## How to Add a New Feature

1. **Model:** Add schema in `src/models/`
2. **Constants:** Add enums in `src/constants/index.js`
3. **Service:** Create `src/services/feature.service.js`
4. **Controller:** Create `src/controllers/feature.controller.js` extending `BaseController`
5. **Validator:** Create `src/validators/feature.validator.js`
6. **Route:** Create `src/routes/feature.routes.js`, mount in `src/routes/index.js`

## Environment Variables

```env
PORT=5000
DB_URI=mongodb://localhost:27017/merijodi
NODE_ENV=development
FRONTEND_DOMAIN=http://localhost:5173

# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Running

```bash
cd Backend
npm install
cp .env.sample .env   # Fill in values
npm run dev            # Development with nodemon
npm start              # Production
```

## Linting & Formatting

```bash
npm run lint           # ESLint
npm run format         # Prettier
```
