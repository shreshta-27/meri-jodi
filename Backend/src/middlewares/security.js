import helmet from "helmet"
import cors from "cors"
import express from "express"

/**
 * Configure and return security-related middleware
 * @param {Object} config - Application configuration
 * @returns {Object} Object containing security middleware functions
 */
export const configureSecurity = (config) => {
    return {
        // Helmet middleware for security headers
        helmetMiddleware: helmet(),

        // CORS middleware with configuration
        corsMiddleware: cors({
            origin: (origin, callback) => {
                if (!origin) return callback(null, true)

                const allowedOrigins = config.security.cors.allowedOrigins || []
                if (allowedOrigins.includes(origin)) {
                    return callback(null, true)
                }

                if (config.env !== "production" && origin.startsWith("http://localhost")) {
                    return callback(null, true)
                }

                return callback(new Error("Not allowed by CORS"), false)
            },
            methods: config.security.cors.allowedMethods,
            allowedHeaders: config.security.cors.allowedHeaders,
            exposedHeaders: config.security.cors.exposedHeaders,
            maxAge: config.security.cors.maxAge,
            credentials: true,
            optionsSuccessStatus: 204,
            preflightContinue: false,
        }),

        // URL-encoded parser with size limits
        urlencodedParserMiddleware: express.urlencoded({
            extended: true,
            limit: "1mb",
        }),
    }
}

export default configureSecurity
