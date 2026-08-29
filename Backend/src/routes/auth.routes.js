import express from "express"
import authService from "../services/auth.service.js"
import { authenticate, attachUser } from "../middlewares/auth.js"
import { sanitizeBody } from "../middlewares/sanitize.js"
import ApiResponse from "../utils/ApiResponse.js"
import {
    registerSchema,
    loginSchema,
    verifyOtpSchema,
    resendOtpSchema,
    googleAuthSchema,
} from "../config/zod.js"

const router = express.Router()

// Helper to format Zod error messages
const formatZodError = (validation) => {
    if (!validation.success) {
        const issues = validation.error.issues || []
        const firstMessage = issues[0]?.message || "Validation failed"
        const errors = issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
        }))
        return { message: firstMessage, errors }
    }
    return null
}

/**
 * POST /api/auth/register
 * Register a new user:
 * Validates input, hashes password, stores pending user in Redis (5 min), and sends verification email via Nodemailer.
 */
router.post("/register", sanitizeBody, async (req, res) => {
    const apiResponse = new ApiResponse(res)
    try {
        const validation = registerSchema.safeParse(req.body)
        const errorDetails = formatZodError(validation)
        if (errorDetails) {
            return apiResponse.error(errorDetails.message, 400)
        }

        const { name, email, password, phone, gender } = validation.data
        const reqIp = req.ip || req.connection?.remoteAddress || "127.0.0.1"

        const result = await authService.registerUser({
            name,
            email,
            password,
            phone,
            gender,
            reqIp,
        })

        return apiResponse.success(result, result.message, 201)
    } catch (error) {
        return apiResponse.error(error.message, error.statusCode || 400)
    }
})

/**
 * GET /api/auth/verify/:token
 * POST /api/auth/verify/:token
 * Verify email verification token from Redis, create user + profile in MongoDB, issue tokens & set cookies.
 */
const handleEmailVerification = async (req, res) => {
    const apiResponse = new ApiResponse(res)
    try {
        const { token } = req.params
        if (!token) {
            return apiResponse.error("Verification token is missing", 400)
        }

        const result = await authService.verifyEmailToken(token, res)
        return apiResponse.success(result, result.message, 200)
    } catch (error) {
        return apiResponse.error(error.message, error.statusCode || 400)
    }
}

router.get("/verify/:token", sanitizeBody, handleEmailVerification)
router.post("/verify/:token", sanitizeBody, handleEmailVerification)

/**
 * POST /api/auth/login
 * Step 1 of Login:
 * Validates email & password, generates 6-digit OTP, stores in Redis (5 min), and sends email via Nodemailer.
 */
router.post("/login", sanitizeBody, async (req, res) => {
    const apiResponse = new ApiResponse(res)
    try {
        const validation = loginSchema.safeParse(req.body)
        const errorDetails = formatZodError(validation)
        if (errorDetails) {
            return apiResponse.error(errorDetails.message, 400)
        }

        const { email, password } = validation.data
        const reqIp = req.ip || req.connection?.remoteAddress || "127.0.0.1"

        const result = await authService.loginUser({ email, password, reqIp })
        return apiResponse.success(result, result.message, 200)
    } catch (error) {
        return apiResponse.error(error.message, error.statusCode || 400)
    }
})

/**
 * POST /api/auth/verify
 * POST /api/auth/verify-otp
 * Step 2 of Login:
 * Verifies OTP from Redis, issues dual JWT tokens (Access + Refresh), sets HTTP-only cookies, and returns user.
 */
const handleVerifyOtp = async (req, res) => {
    const apiResponse = new ApiResponse(res)
    try {
        const validation = verifyOtpSchema.safeParse(req.body)
        const errorDetails = formatZodError(validation)
        if (errorDetails) {
            return apiResponse.error(errorDetails.message, 400)
        }

        const { email, otp } = validation.data
        const result = await authService.verifyLoginOtp({ email, otp, res })

        return apiResponse.success(result, result.message, 200)
    } catch (error) {
        return apiResponse.error(error.message, error.statusCode || 400)
    }
}

router.post("/verify", sanitizeBody, handleVerifyOtp)
router.post("/verify-otp", sanitizeBody, handleVerifyOtp)

/**
 * POST /api/auth/resend-otp
 * Resend OTP code to email with 60s rate limit.
 */
router.post("/resend-otp", sanitizeBody, async (req, res) => {
    const apiResponse = new ApiResponse(res)
    try {
        const validation = resendOtpSchema.safeParse(req.body)
        const errorDetails = formatZodError(validation)
        if (errorDetails) {
            return apiResponse.error(errorDetails.message, 400)
        }

        const { email } = validation.data
        const reqIp = req.ip || req.connection?.remoteAddress || "127.0.0.1"

        const result = await authService.resendLoginOtp({ email, reqIp })
        return apiResponse.success(result, result.message, 200)
    } catch (error) {
        return apiResponse.error(error.message, error.statusCode || 400)
    }
})

/**
 * POST /api/auth/google
 * Google OAuth Login / Registration:
 * Verifies Google ID token, finds or creates User + Profile, issues tokens and sets cookies.
 */
router.post("/google", sanitizeBody, async (req, res) => {
    const apiResponse = new ApiResponse(res)
    try {
        const validation = googleAuthSchema.safeParse(req.body)
        const errorDetails = formatZodError(validation)
        if (errorDetails) {
            return apiResponse.error(errorDetails.message, 400)
        }

        const { idToken, credential, email, name, googleId, avatar } = validation.data
        const result = await authService.googleAuth({
            idToken,
            credential,
            email,
            name,
            googleId,
            avatar,
            res,
        })

        return apiResponse.success(result, result.message, 200)
    } catch (error) {
        return apiResponse.error(error.message, error.statusCode || 400)
    }
})

/**
 * POST /api/auth/refresh
 * Refresh Access Token using Refresh Token from cookies or request body.
 */
router.post("/refresh", sanitizeBody, async (req, res) => {
    const apiResponse = new ApiResponse(res)
    try {
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken
        const result = await authService.refreshUserToken({ refreshToken, res })
        return apiResponse.success(result, result.message, 200)
    } catch (error) {
        return apiResponse.error(error.message, error.statusCode || 401)
    }
})

/**
 * POST /api/auth/logout
 * Log out user, revoke refresh token from Redis, and clear HTTP cookies.
 */
router.post("/logout", authenticate, async (req, res) => {
    const apiResponse = new ApiResponse(res)
    try {
        const result = await authService.logoutUser({ userId: req.userId, res })
        return apiResponse.success(result, result.message, 200)
    } catch (error) {
        return apiResponse.error(error.message, 400)
    }
})

/**
 * GET /api/auth/me
 * Get current authenticated user details (cached in Redis).
 */
router.get("/me", authenticate, attachUser, async (req, res) => {
    const apiResponse = new ApiResponse(res)
    try {
        return apiResponse.success(
            { user: req.user },
            "User retrieved successfully"
        )
    } catch (error) {
        return apiResponse.error(error.message, 400)
    }
})

/*
 * ==============================================================================
 * TWILIO SMS OTP ROUTES - COMMENTED FOR REFERENCE AS REQUESTED
 * ==============================================================================
 * 
 * router.post("/send-otp", async (req, res) => {
 *     const apiResponse = new ApiResponse(res)
 *     try {
 *         const { phone } = req.body
 *         if (!phone) return apiResponse.error("Phone number is required", 400)
 *         const result = await authService.sendOtp(phone)
 *         return apiResponse.success({ sid: result.sid }, "OTP sent successfully")
 *     } catch (error) {
 *         return apiResponse.error(error.message, 400)
 *     }
 * })
 * ==============================================================================
 */

export default router
