import express from "express"
import rateLimit from "express-rate-limit"
import compression from "compression"
import { config } from "./config/config.js"
import routes from "./routes/index.js"
import authRoutes from "./routes/auth.routes.js"
import healthRoutes from "./routes/health.routes.js"
import errorHandler from "./middlewares/errorHandler.js"
import configureLogger from "./middlewares/logger.js"
import { configureSecurity } from "./middlewares/security.js"
import { authenticate } from "./middlewares/auth.js"
import homeController from "./controllers/home.controller.js"
import requestId from "./middlewares/requestId.js"
import requestTimeout from "./middlewares/requestTimeout.js"

const setupApp = () => {
    const app = express()

    const { helmetMiddleware, corsMiddleware, urlencodedParserMiddleware } =
        configureSecurity(config)

    if (config.env === "production") {
        app.set("trust proxy", 1)
    }

    const limiter = rateLimit({
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, message: "Too many requests, please try again later" },

    })
    app.use(limiter)

    app.use(helmetMiddleware)
    app.use(corsMiddleware)
    app.use(requestId)

    app.get("/", homeController.getServerInfo.bind(homeController))

    app.use(express.json({ limit: "1mb" }))
    app.use(urlencodedParserMiddleware)
    app.use(compression())
    app.use(requestTimeout(30000))
    app.use(configureLogger(config.env))

    // Public auth routes
    app.use("/api/auth", authRoutes)

    // Health check (public)
    app.use("/api/health", healthRoutes)

    // All routes below require auth
    app.use(authenticate)

    // Protected API routes
    app.use("/api/v1", routes)

    // 404 handler
    app.use((req, res) => {
        homeController.notFound(req, res)
    })

    app.use(errorHandler)

    return app
}

const app = setupApp()
export default app
