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
    frontendDomain: process.env.FRONTEND_DOMAIN,
    jwtSecret: process.env.JWT_SECRET,

    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID,
    },

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
            sameSite: "strict",
        },
        cors: {
            allowedOrigins: [
                process.env.FRONTEND_DOMAIN,
                ...(process.env.NODE_ENV !== "production"
                    ? ["http://localhost:5173", "http://127.0.0.1:5173"]
                    : []),
            ].filter(Boolean),
            allowedMethods: ["GET", "POST", "PUT", "DELETE"],
            allowedHeaders: ["Content-Type", "Authorization"],
            exposedHeaders: ["Content-Length", "X-Rate-Limit"],
            maxAge: 86400,
        },
    },
}

export const config = Object.freeze(_config)
