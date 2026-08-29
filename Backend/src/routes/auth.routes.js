import express from "express"
import authService from "../services/auth.service.js"
import { authenticate, attachUser } from "../middlewares/auth.js"
import ApiResponse from "../utils/ApiResponse.js"

const router = express.Router()

/**
 * POST /api/auth/send-otp
 * Send OTP to phone number via Twilio
 */
router.post("/send-otp", async (req, res) => {
    const apiResponse = new ApiResponse(res)
    try {
        const { phone } = req.body
        if (!phone) {
            return apiResponse.error("Phone number is required", 400)
        }

        const result = await authService.sendOtp(phone)
        return apiResponse.success(
            { sid: result.sid },
            "OTP sent successfully"
        )
    } catch (error) {
        return apiResponse.error(error.message, 400)
    }
})

/**
 * POST /api/auth/verify-otp
 * Verify OTP and return JWT token
 */
router.post("/verify-otp", async (req, res) => {
    const apiResponse = new ApiResponse(res)
    try {
        const { phone, code, name } = req.body
        if (!phone || !code) {
            return apiResponse.error("Phone and code are required", 400)
        }

        const isValid = await authService.verifyOtp(phone, code)
        if (!isValid) {
            return apiResponse.error("Invalid or expired OTP", 400)
        }

        const user = await authService.findOrCreateUserByPhone(phone, name)
        const token = authService.generateToken(user)

        return apiResponse.success(
            { token, user: user.toAuthJSON() },
            "OTP verified successfully"
        )
    } catch (error) {
        return apiResponse.error(error.message, 400)
    }
})

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post("/login", async (req, res) => {
    const apiResponse = new ApiResponse(res)
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return apiResponse.error("Email and password are required", 400)
        }

        const user = await authService.findOrCreateUserByEmail(email, password)
        const token = authService.generateToken(user)

        return apiResponse.success(
            { token, user: user.toAuthJSON() },
            "Login successful"
        )
    } catch (error) {
        if (error.message === "Invalid email or password") {
            return apiResponse.error(error.message, 401)
        }
        return apiResponse.error(error.message, 400)
    }
})

/**
 * POST /api/auth/google
 * Login/Register with Google OAuth
 */
router.post("/google", async (req, res) => {
    const apiResponse = new ApiResponse(res)
    try {
        const { googleId, email, name } = req.body
        if (!googleId) {
            return apiResponse.error("Google ID is required", 400)
        }

        const user = await authService.findOrCreateUserByGoogle(
            googleId,
            email,
            name
        )
        const token = authService.generateToken(user)

        return apiResponse.success(
            { token, user: user.toAuthJSON() },
            "Google login successful"
        )
    } catch (error) {
        return apiResponse.error(error.message, 400)
    }
})

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get("/me", authenticate, attachUser, async (req, res) => {
    const apiResponse = new ApiResponse(res)
    try {
        return apiResponse.success(
            { user: req.user.toAuthJSON() },
            "User retrieved"
        )
    } catch (error) {
        return apiResponse.error(error.message, 400)
    }
})

export default router
