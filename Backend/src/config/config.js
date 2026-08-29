import { config as conf } from "dotenv"
conf()

const requiredEnvVars = [
    "DB_URI",
    "JWT_SECRET",
    "FRONTEND_DOMAIN",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
]
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
    console.error(
        `Missing required environment variables: ${missingEnvVars.join(", ")}`
    )
    process.exit(1)
}

const _config = {
    port: process.env.PORT || 5000,
    dbURL: process.env.DB_URI,
    env: process.env.NODE_ENV || "development",
    frontendDomain: process.env.FRONTEND_DOMAIN || "http://localhost:5173",
    frontendUrl: process.env.FRONTEND_URL || process.env.FRONTEND_DOMAIN || "http://localhost:5173",
    appName: process.env.APP_NAME || "MeriJodi",
    jwtSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.REFRESH_SECRET || process.env.JWT_SECRET + "_refresh",
    redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",

    smtp: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASSWORD || "",
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT, 10) || 465,
    },

    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
    },

    /*
     * Twilio (SMS OTP) - Commented for reference as requested
     */
    /*
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID,
    },
    */

    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },

    rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: process.env.NODE_ENV === "production" ? 60 : 1000,
    },

    security: {
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        },
        cors: {
            allowedOrigins: [
                process.env.FRONTEND_DOMAIN,
                process.env.FRONTEND_URL,
                ...(process.env.NODE_ENV !== "production"
                    ? ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5000"]
                    : []),
            ].filter(Boolean),
            allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
            exposedHeaders: ["Content-Length", "X-Rate-Limit"],
            credentials: true,
            maxAge: 86400,
        },
    },
}

export const config = Object.freeze(_config)
