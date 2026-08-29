import express from "express"
import mongoose from "mongoose"
import ApiResponse from "../utils/ApiResponse.js"

const router = express.Router()

/**
 * @route   GET /api/health
 * @desc    Health check endpoint (verifies MongoDB connectivity)
 * @access  Public
 */
router.get("/", async (req, res) => {
    const apiResponse = new ApiResponse(res)

    const mongoStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected"

    const healthData = {
        status: mongoStatus === "connected" ? "UP" : "DEGRADED",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: process.env.npm_package_version || "1.0.0",
        services: {
            mongodb: mongoStatus,
        },
    }

    const statusCode = mongoStatus === "connected" ? 200 : 503
    apiResponse.success(healthData, "Health check completed", statusCode)
})

export default router
