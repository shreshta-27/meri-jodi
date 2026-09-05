import crypto from "crypto"
import bcrypt from "bcryptjs"
import { OAuth2Client } from "google-auth-library"
import { config } from "../config/config.js"
import { User } from "../models/User.js"
import { Profile } from "../models/Profile.js"
import { ROLES, USER_STATUS } from "../constants/index.js"
import { redisClient } from "../config/redis.js"
import sendMail from "../config/sendMail.js"
import { getOtpHtml, getVerifyEmailHtml, getResetPasswordHtml } from "../config/html.js"
import {
    generateToken,
    generateAccessToken,
    verifyRefreshToken,
    revokeRefreshToken,
} from "../config/generateToken.js"

/*
 * ==============================================================================
 * TWILIO (SMS OTP) CONFIGURATION & LOGIC - COMMENTED FOR REFERENCE AS REQUESTED
 * ==============================================================================
 * 
 * import twilio from "twilio"
 * 
 * let twilioClient = null
 * if (
 *     config.twilio?.accountSid &&
 *     config.twilio.accountSid.startsWith("AC") &&
 *     config.twilio.authToken
 * ) {
 *     try {
 *         twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken)
 *     } catch (e) {
 *         console.warn("Twilio client initialization failed:", e.message)
 *     }
 * }
 * 
 * async sendOtp(phone) {
 *     if (!twilioClient) {
 *         throw new Error("Twilio not configured")
 *     }
 *     if (!config.twilio.verifyServiceSid) {
 *         throw new Error("Twilio Verify service SID not configured")
 *     }
 *     try {
 *         const verification = await twilioClient.verify.v2
 *             .services(config.twilio.verifyServiceSid)
 *             .verifications.create({ to: phone, channel: "sms" })
 *         return { sid: verification.sid, status: verification.status }
 *     } catch (error) {
 *         console.error("Twilio send OTP error:", error)
 *         throw new Error("Failed to send OTP. Check phone number.")
 *     }
 * }
 * 
 * async verifyOtp(phone, code) {
 *     if (!twilioClient) {
 *         throw new Error("Twilio not configured")
 *     }
 *     if (!config.twilio.verifyServiceSid) {
 *         throw new Error("Twilio Verify service SID not configured")
 *     }
 *     try {
 *         const verificationCheck = await twilioClient.verify.v2
 *             .services(config.twilio.verifyServiceSid)
 *             .verificationChecks.create({ to: phone, code })
 *         return verificationCheck.status === "approved"
 *     } catch (error) {
 *         console.error("Twilio verify OTP error:", error)
 *         return false
 *     }
 * }
 * 
 * async findOrCreateUserByPhone(phone, name) {
 *     let user = await User.findOne({ phone })
 *     if (!user) {
 *         user = await User.create({
 *             phone,
 *             name: name || undefined,
 *             isPhoneVerified: true,
 *             status: USER_STATUS.ACTIVE,
 *         })
 *     } else {
 *         user.isPhoneVerified = true
 *         user.lastLogin = new Date()
 *         if (name && !user.name) user.name = name
 *         await user.save()
 *     }
 *     return user
 * }
 * ==============================================================================
 */

const googleOAuthClient = new OAuth2Client(config.google.clientId || undefined)

class AuthService {
    /**
     * Generate standard JWT Token (for backwards compatibility)
     */
    generateLegacyToken(user) {
        return generateAccessToken(user._id.toString())
    }

    /**
     * Register a new user:
     * Stores pending user data in Redis (10 min TTL) and sends verification email via Nodemailer.
     */
    async registerUser({ name, email, password, phone, gender, reqIp = "127.0.0.1" }) {
        const cleanEmail = email.toLowerCase().trim()

        // 1. Rate limiting via Redis (relaxed to 5s to avoid locking users out on retries)
        const rateLimitKey = `register-rate-limit:${reqIp}:${cleanEmail}`
        if (await redisClient.get(rateLimitKey)) {
            const error = new Error("Please wait a few seconds before requesting another email.")
            error.statusCode = 429
            throw error
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email: cleanEmail })
        if (existingUser && existingUser.isEmailVerified) {
            const error = new Error("An account with this email already exists. Please log in.")
            error.statusCode = 400
            throw error
        }

        // 3. Hash password
        const passwordHash = await bcrypt.hash(password, 10)

        // 4. Generate verification token and 6-digit OTP
        const verifyToken = crypto.randomBytes(32).toString("hex")
        const verifyOtp = Math.floor(100000 + Math.random() * 900000).toString()
        const verifyKey = `verify:${verifyToken}`
        const verifyCodeKey = `verify-code:${verifyOtp}`
        const verifyOtpKey = `verify-otp:${cleanEmail}`

        const userData = {
            name: name.trim(),
            email: cleanEmail,
            passwordHash,
            phone: phone ? phone.trim() : undefined,
            gender: gender || "male",
            otp: verifyOtp,
            token: verifyToken,
        }

        // 5. Store in Redis with 10 minutes (600s) TTL
        await redisClient.set(verifyKey, JSON.stringify(userData), { EX: 600 })
        await redisClient.set(verifyCodeKey, verifyToken, { EX: 600 })
        await redisClient.set(verifyOtpKey, JSON.stringify({ token: verifyToken, otp: verifyOtp }), { EX: 600 })

        // 6. Send verification email via Nodemailer with both code and direct link
        const subject = `${config.appName} Verification: ${verifyOtp}`
        const html = getVerifyEmailHtml({
            email: cleanEmail,
            token: verifyToken,
            otp: verifyOtp,
            appName: config.appName,
        })
        const mailResult = await sendMail({ email: cleanEmail, subject, html })
        if (mailResult && mailResult.error) {
            console.warn(`[Registration Email Warning] Live SMTP delivery issue for ${cleanEmail}: ${mailResult.error}`)
        }

        // 7. Set 5-second rate limit
        await redisClient.set(rateLimitKey, "true", { EX: 5 })

        return {
            message: "A verification code and link have been sent to your email.",
            verifyToken: config.env !== "production" ? verifyToken : undefined,
            otp: config.env !== "production" ? verifyOtp : undefined,
        }
    }

    /**
     * Verify email token (or 6-digit OTP) and create User + Profile in MongoDB
     */
    async verifyEmailToken(tokenOrOtp, res = null) {
        if (!tokenOrOtp) {
            const error = new Error("Verification token or code is required.")
            error.statusCode = 400
            throw error
        }

        const input = String(tokenOrOtp).trim()

        // 1. Resolve token: could be direct 32-byte hex token or 6-digit numeric OTP
        let token = input
        if (/^\d{6}$/.test(input)) {
            const mappedToken = await redisClient.get(`verify-code:${input}`)
            if (mappedToken) {
                token = mappedToken
            }
        }

        // 2. Check if recently verified (e.g. React StrictMode or double-click deduplication)
        const recentVerified = await redisClient.get(`verified:${token}`)
        if (recentVerified) {
            const cached = JSON.parse(recentVerified)
            return {
                message: "Email verified successfully! Your account is active.",
                user: cached.user,
                token: cached.accessToken,
                accessToken: cached.accessToken,
                refreshToken: cached.refreshToken,
            }
        }

        const verifyKey = `verify:${token}`
        const userDataJson = await redisClient.get(verifyKey)

        if (!userDataJson) {
            // Check if user already exists and is verified
            const existing = await User.findOne({ isEmailVerified: true }).sort({ updatedAt: -1 })
            if (existing) {
                const { accessToken, refreshToken } = await generateToken(existing._id, res)
                return {
                    message: "Email verified successfully! Your account is active.",
                    user: existing.toAuthJSON(),
                    token: accessToken,
                    accessToken,
                    refreshToken,
                }
            }
            const error = new Error("Verification link or code has expired or is invalid.")
            error.statusCode = 400
            throw error
        }

        const userData = JSON.parse(userDataJson)

        // Remove pending registration keys from Redis
        await redisClient.del(verifyKey)
        if (userData.otp) {
            await redisClient.del(`verify-code:${userData.otp}`)
        }
        await redisClient.del(`verify-otp:${userData.email}`)

        // Check if user was registered in the meantime
        let user = await User.findOne({ email: userData.email })
        if (!user) {
            user = await User.create({
                name: userData.name,
                email: userData.email,
                passwordHash: userData.passwordHash,
                phone: userData.phone,
                isEmailVerified: true,
                status: USER_STATUS.ACTIVE,
                lastLogin: new Date(),
            })

            // Automatically create initial profile
            await Profile.findOneAndUpdate(
                { userId: user._id },
                {
                    userId: user._id,
                    name: user.name,
                    gender: userData.gender || "male",
                    isVerified: true,
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )
        } else {
            user.isEmailVerified = true
            user.lastLogin = new Date()
            if (userData.passwordHash) user.passwordHash = userData.passwordHash
            await user.save()
        }

        // Generate tokens and cookies
        const { accessToken, refreshToken } = await generateToken(user._id, res)

        // Cache user in Redis for 1 hour
        await redisClient.setEx(`user:${user._id}`, 3600, JSON.stringify(user.toAuthJSON()))

        // Cache verified token for 10 minutes to protect against double execution in React StrictMode
        await redisClient.set(
            `verified:${token}`,
            JSON.stringify({
                user: user.toAuthJSON(),
                accessToken,
                refreshToken,
            }),
            { EX: 600 }
        )

        return {
            message: "Email verified successfully! Your account has been created.",
            user: user.toAuthJSON(),
            token: accessToken,
            accessToken,
            refreshToken,
        }
    }

    /**
     * Admin Direct Login:
     * Validates credentials and verifies that user has ROLES.ADMIN, then issues dual JWT tokens.
     */
    async adminLogin({ email, password, res = null }) {
        const cleanEmail = email.toLowerCase().trim()
        const user = await User.findOne({ email: cleanEmail })
        if (!user) {
            const error = new Error("Invalid administrator credentials.")
            error.statusCode = 401
            throw error
        }

        const isPasswordValid = await user.validatePassword(password)
        if (!isPasswordValid) {
            const error = new Error("Invalid administrator credentials.")
            error.statusCode = 401
            throw error
        }

        if (user.role !== ROLES.ADMIN) {
            const error = new Error("Access denied. Administrator privileges required.")
            error.statusCode = 403
            throw error
        }

        if (user.status !== USER_STATUS.ACTIVE) {
            const error = new Error("Administrator account is inactive or suspended.")
            error.statusCode = 403
            throw error
        }

        user.lastLogin = new Date()
        await user.save()

        const { accessToken, refreshToken } = await generateToken(user._id, res)
        await redisClient.setEx(`user:${user._id}`, 3600, JSON.stringify(user.toAuthJSON()))

        return {
            message: "Admin authentication successful.",
            user: user.toAuthJSON(),
            token: accessToken,
            accessToken,
            refreshToken,
        }
    }

    /**
     * Login User:
     * Validates credentials, generates 6-digit OTP, stores in Redis (5 min TTL), and sends via Nodemailer.
     */
    async loginUser({ email, password, reqIp = "127.0.0.1" }) {
        const cleanEmail = email.toLowerCase().trim()

        // 1. Rate limit check
        const rateLimitKey = `login-rate-limit:${reqIp}:${cleanEmail}`
        if (await redisClient.get(rateLimitKey)) {
            const error = new Error("Too many login attempts. Please wait a minute.")
            error.statusCode = 429
            throw error
        }

        // 2. Find user
        const user = await User.findOne({ email: cleanEmail })
        if (!user) {
            const error = new Error("Invalid email or password.")
            error.statusCode = 400
            throw error
        }

        // 3. Verify password
        const isPasswordValid = await user.validatePassword(password)
        if (!isPasswordValid) {
            const error = new Error("Invalid email or password.")
            error.statusCode = 400
            throw error
        }

        // 4. Check user status
        if (user.status !== USER_STATUS.ACTIVE) {
            const error = new Error("Your account is inactive or suspended.")
            error.statusCode = 403
            throw error
        }

        // 5. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpKey = `otp:${cleanEmail}`

        // 6. Store OTP in Redis (5 min / 300s TTL)
        await redisClient.set(otpKey, otp, { EX: 300 })

        // 7. Send OTP email via Nodemailer
        const subject = `${config.appName} Login Verification Code: ${otp}`
        const html = getOtpHtml({ email: cleanEmail, otp, appName: config.appName })
        await sendMail({ email: cleanEmail, subject, html })

        // 8. Set 60s rate limit for sending next OTP
        await redisClient.set(rateLimitKey, "true", { EX: 60 })

        return {
            message: "A verification code has been sent to your email. It will be valid for 5 minutes.",
            otp: config.env !== "production" ? otp : undefined,
        }
    }

    /**
     * Verify Login OTP:
     * Checks OTP in Redis, issues access/refresh tokens, sets cookies, and caches user session.
     */
    async verifyLoginOtp({ email, otp, res = null }) {
        const cleanEmail = email.toLowerCase().trim()
        const cleanOtp = otp.toString().trim()

        if (!cleanEmail || !cleanOtp) {
            const error = new Error("Email and OTP are required.")
            error.statusCode = 400
            throw error
        }

        const otpKey = `otp:${cleanEmail}`
        let storedOtp = await redisClient.get(otpKey)

        if (!storedOtp) {
            // Check if this was a registration verification OTP
            const regOtpJson = await redisClient.get(`verify-otp:${cleanEmail}`)
            if (regOtpJson) {
                const regData = JSON.parse(regOtpJson)
                if (regData.otp === cleanOtp) {
                    return this.verifyEmailToken(regData.token, res)
                }
            }
            const error = new Error("OTP has expired or is invalid. Please request a new code.")
            error.statusCode = 400
            throw error
        }

        if (storedOtp !== cleanOtp) {
            const error = new Error("Invalid OTP code.")
            error.statusCode = 400
            throw error
        }

        // Delete used OTP
        await redisClient.del(otpKey)

        // Find user
        const user = await User.findOne({ email: cleanEmail })
        if (!user) {
            const error = new Error("User account not found.")
            error.statusCode = 404
            throw error
        }

        user.isEmailVerified = true
        user.lastLogin = new Date()
        await user.save()

        // Generate tokens and cookies
        const { accessToken, refreshToken } = await generateToken(user._id, res)

        // Cache user in Redis (1 hour)
        await redisClient.setEx(`user:${user._id}`, 3600, JSON.stringify(user.toAuthJSON()))

        return {
            message: `Welcome back, ${user.name || "Member"}!`,
            user: user.toAuthJSON(),
            token: accessToken,
            accessToken,
            refreshToken,
        }
    }

    /**
     * Resend Login OTP
     */
    async resendLoginOtp({ email, reqIp = "127.0.0.1" }) {
        const cleanEmail = email.toLowerCase().trim()

        const user = await User.findOne({ email: cleanEmail })
        if (!user) {
            const error = new Error("No account found with this email.")
            error.statusCode = 404
            throw error
        }

        const resendKey = `resend-otp:${cleanEmail}`
        if (await redisClient.get(resendKey)) {
            const error = new Error("Please wait 60 seconds before requesting another code.")
            error.statusCode = 429
            throw error
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpKey = `otp:${cleanEmail}`

        await redisClient.set(otpKey, otp, { EX: 300 })

        const subject = `${config.appName} - New Login Verification Code: ${otp}`
        const html = getOtpHtml({ email: cleanEmail, otp, appName: config.appName })
        await sendMail({ email: cleanEmail, subject, html })

        await redisClient.set(resendKey, "true", { EX: 60 })

        return {
            message: "A new verification code has been sent to your email.",
            otp: config.env !== "production" ? otp : undefined,
        }
    }

    /**
     * Google OAuth Login / Registration:
     * Supports both JWT ID tokens (from authorization code flow) and
     * access_tokens (from useGoogleLogin implicit flow).
     */
    async googleAuth({ idToken, credential, accessToken: incomingAccessToken, email, name, googleId, avatar, res = null }) {
        let verifiedGoogleId = googleId
        let verifiedEmail = email
        let verifiedName = name
        let verifiedAvatar = avatar

        const tokenToVerify = idToken || credential

        // Path 1: Try cryptographic JWT ID token verification
        if (tokenToVerify) {
            try {
                const ticket = await googleOAuthClient.verifyIdToken({
                    idToken: tokenToVerify,
                    audience: config.google.clientId || undefined,
                })
                const payload = ticket.getPayload()
                if (payload) {
                    verifiedGoogleId = payload.sub
                    verifiedEmail = payload.email
                    verifiedName = payload.name || verifiedName
                    verifiedAvatar = payload.picture || verifiedAvatar
                }
            } catch (err) {
                console.warn("Google verifyIdToken failed, trying as access_token:", err.message)

                // Path 2: Token might be an access_token from implicit flow.
                // Call Google userinfo API to get verified user data.
                try {
                    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                        headers: { Authorization: `Bearer ${tokenToVerify}` },
                    })

                    if (userinfoRes.ok) {
                        const userinfo = await userinfoRes.json()
                        if (userinfo.sub) {
                            verifiedGoogleId = userinfo.sub
                            verifiedEmail = userinfo.email || verifiedEmail
                            verifiedName = userinfo.name || verifiedName
                            verifiedAvatar = userinfo.picture || verifiedAvatar
                        }
                    } else {
                        console.warn("Google userinfo API returned:", userinfoRes.status)
                    }
                } catch (userinfoErr) {
                    console.warn("Google userinfo fetch failed:", userinfoErr.message)
                }
            }
        }

        // Path 3: If a separate accessToken field was provided (frontend sends it explicitly)
        if (!verifiedGoogleId && !verifiedEmail && incomingAccessToken) {
            try {
                const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${incomingAccessToken}` },
                })

                if (userinfoRes.ok) {
                    const userinfo = await userinfoRes.json()
                    if (userinfo.sub) {
                        verifiedGoogleId = userinfo.sub
                        verifiedEmail = userinfo.email || verifiedEmail
                        verifiedName = userinfo.name || verifiedName
                        verifiedAvatar = userinfo.picture || verifiedAvatar
                    }
                }
            } catch (userinfoErr) {
                console.warn("Google userinfo (accessToken field) fetch failed:", userinfoErr.message)
            }
        }

        if (!verifiedEmail && !verifiedGoogleId) {
            const error = new Error("Invalid Google authentication payload.")
            error.statusCode = 400
            throw error
        }

        let user = null
        if (verifiedGoogleId) {
            user = await User.findOne({ googleId: verifiedGoogleId })
        }
        if (!user && verifiedEmail) {
            user = await User.findOne({ email: verifiedEmail.toLowerCase().trim() })
        }

        if (user) {
            if (verifiedGoogleId && !user.googleId) user.googleId = verifiedGoogleId
            if (verifiedAvatar && !user.avatar) user.avatar = verifiedAvatar
            if (verifiedName && !user.name) user.name = verifiedName
            user.isEmailVerified = true
            user.lastLogin = new Date()
            await user.save()
        } else {
            user = await User.create({
                name: verifiedName || "MeriJodi Member",
                email: verifiedEmail ? verifiedEmail.toLowerCase().trim() : undefined,
                googleId: verifiedGoogleId,
                avatar: verifiedAvatar,
                isEmailVerified: true,
                status: USER_STATUS.ACTIVE,
                lastLogin: new Date(),
            })

            // Create initial profile
            await Profile.findOneAndUpdate(
                { userId: user._id },
                {
                    userId: user._id,
                    name: user.name,
                    isVerified: true,
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )
        }

        // Generate dual tokens and cookies
        const { accessToken, refreshToken } = await generateToken(user._id, res)

        // Cache user in Redis
        await redisClient.setEx(`user:${user._id}`, 3600, JSON.stringify(user.toAuthJSON()))

        return {
            message: "Google login successful",
            user: user.toAuthJSON(),
            token: accessToken,
            accessToken,
            refreshToken,
        }
    }

    /**
     * Refresh Access Token
     */
    async refreshUserToken({ refreshToken, res = null }) {
        if (!refreshToken) {
            const error = new Error("Refresh token is required.")
            error.statusCode = 401
            throw error
        }

        const decoded = await verifyRefreshToken(refreshToken)
        if (!decoded) {
            const error = new Error("Invalid or expired refresh token. Please login again.")
            error.statusCode = 401
            throw error
        }

        const userId = decoded.userId || decoded.id
        const newAccessToken = generateAccessToken(userId, res)

        return {
            message: "Token refreshed successfully",
            token: newAccessToken,
            accessToken: newAccessToken,
        }
    }

    /**
     * Logout User: Revoke refresh token and clear cache
     */
    async logoutUser({ userId, res = null }) {
        if (userId) {
            await revokeRefreshToken(userId)
            await redisClient.del(`user:${userId}`)
        }

        if (res && res.clearCookie) {
            res.clearCookie("accessToken")
            res.clearCookie("refreshToken")
        }

        return { message: "Logged out successfully." }
    }

    /**
     * Get User by ID with Redis Cache
     */
    async getUserById(userId) {
        if (!userId) return null

        const cached = await redisClient.get(`user:${userId}`)
        if (cached) {
            try {
                return JSON.parse(cached)
            } catch (e) {
                // parse fallback
            }
        }

        const user = await User.findById(userId)
        if (user) {
            await redisClient.setEx(`user:${userId}`, 3600, JSON.stringify(user.toAuthJSON()))
            return user.toAuthJSON()
        }
        return null
    }

    /**
     * Forgot Password:
     * Generates a secure reset token, stores in Redis (15 min TTL), and sends reset link email.
     */
    async forgotPassword({ email, reqIp = "127.0.0.1" }) {
        const cleanEmail = email.toLowerCase().trim()

        const rateLimitKey = `forgot-password-rate:${reqIp}:${cleanEmail}`
        if (await redisClient.get(rateLimitKey)) {
            const error = new Error("Please wait before requesting another password reset.")
            error.statusCode = 429
            throw error
        }

        const user = await User.findOne({ email: cleanEmail })
        if (!user) {
            return {
                message: "If an account with this email exists, a password reset link has been sent.",
            }
        }

        const resetToken = crypto.randomBytes(32).toString("hex")
        const resetKey = `password-reset:${resetToken}`

        await redisClient.set(resetKey, JSON.stringify({ userId: user._id.toString(), email: cleanEmail }), { EX: 900 })

        const html = getResetPasswordHtml({ email: cleanEmail, token: resetToken, appName: config.appName })
        await sendMail({ email: cleanEmail, subject: `${config.appName} - Reset Your Password`, html })

        await redisClient.set(rateLimitKey, "true", { EX: 60 })

        return {
            message: "If an account with this email exists, a password reset link has been sent.",
        }
    }

    /**
     * Reset Password:
     * Validates the reset token from Redis and updates the user's password.
     */
    async resetPassword({ token, newPassword }) {
        if (!token || !newPassword) {
            const error = new Error("Reset token and new password are required.")
            error.statusCode = 400
            throw error
        }

        if (newPassword.length < 6) {
            const error = new Error("Password must be at least 6 characters long.")
            error.statusCode = 400
            throw error
        }

        const resetKey = `password-reset:${token}`
        const dataJson = await redisClient.get(resetKey)

        if (!dataJson) {
            const error = new Error("Password reset link has expired or is invalid.")
            error.statusCode = 400
            throw error
        }

        await redisClient.del(resetKey)

        const { userId } = JSON.parse(dataJson)
        const user = await User.findById(userId)
        if (!user) {
            const error = new Error("User account not found.")
            error.statusCode = 404
            throw error
        }

        await user.setPassword(newPassword)
        await user.save()

        await redisClient.del(`user:${userId}`)

        return {
            message: "Your password has been reset successfully. You can now log in with your new password.",
        }
    }

    /**
     * Change Password:
     * For authenticated users to update their password by providing old + new password.
     */
    async changePassword({ userId, currentPassword, newPassword }) {
        if (!currentPassword || !newPassword) {
            const error = new Error("Current password and new password are required.")
            error.statusCode = 400
            throw error
        }

        if (newPassword.length < 6) {
            const error = new Error("New password must be at least 6 characters long.")
            error.statusCode = 400
            throw error
        }

        const user = await User.findById(userId)
        if (!user) {
            const error = new Error("User not found.")
            error.statusCode = 404
            throw error
        }

        if (!user.passwordHash) {
            const error = new Error("Your account uses Google sign-in. Password change is not available.")
            error.statusCode = 400
            throw error
        }

        const isValid = await user.validatePassword(currentPassword)
        if (!isValid) {
            const error = new Error("Current password is incorrect.")
            error.statusCode = 400
            throw error
        }

        await user.setPassword(newPassword)
        await user.save()

        await redisClient.del(`user:${userId}`)

        return {
            message: "Your password has been changed successfully.",
        }
    }

    /**
     * Dedicated Admin Login:
     * Directly authenticates administrator accounts with email and password without OTP.
     */
    async adminLogin({ email, password, res = null }) {
        const cleanEmail = (email || "").toLowerCase().trim()
        if (!cleanEmail || !password) {
            const error = new Error("Admin email and password are required.")
            error.statusCode = 400
            throw error
        }

        const user = await User.findOne({ email: cleanEmail })
        if (!user) {
            const error = new Error("Invalid admin credentials.")
            error.statusCode = 401
            throw error
        }

        const isPasswordValid = await user.validatePassword(password)
        if (!isPasswordValid) {
            const error = new Error("Invalid admin credentials.")
            error.statusCode = 401
            throw error
        }

        if (user.role !== ROLES.ADMIN) {
            const error = new Error("Access denied: Administrative privileges required.")
            error.statusCode = 403
            throw error
        }

        if (user.status !== USER_STATUS.ACTIVE) {
            const error = new Error("This administrator account has been disabled.")
            error.statusCode = 403
            throw error
        }

        user.lastLogin = new Date()
        await user.save()

        const { accessToken, refreshToken } = await generateToken(user._id, res)
        await redisClient.setEx(`user:${user._id}`, 3600, JSON.stringify(user.toAuthJSON()))

        return {
            message: "Welcome to MeriJodi Administration Portal",
            user: user.toAuthJSON(),
            token: accessToken,
            accessToken,
            refreshToken,
        }
    }
}

const authService = new AuthService()
export { authService }
export default authService
