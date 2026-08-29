import jwt from "jsonwebtoken"
import twilio from "twilio"
import { config } from "../config/config.js"
import { User } from "../models/User.js"
import { USER_STATUS } from "../constants/index.js"

let twilioClient = null
if (
    config.twilio.accountSid &&
    config.twilio.accountSid.startsWith("AC") &&
    config.twilio.authToken
) {
    try {
        twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken)
    } catch (e) {
        console.warn("Twilio client initialization failed:", e.message)
    }
}

class AuthService {
    generateToken(user) {
        return jwt.sign(
            { userId: user._id.toString(), role: user.role },
            config.jwtSecret,
            { expiresIn: "7d" }
        )
    }

    verifyToken(token) {
        return jwt.verify(token, config.jwtSecret)
    }

    async sendOtp(phone) {
        if (!twilioClient) {
            throw new Error("Twilio not configured")
        }
        if (!config.twilio.verifyServiceSid) {
            throw new Error("Twilio Verify service SID not configured")
        }

        try {
            const verification = await twilioClient.verify.v2
                .services(config.twilio.verifyServiceSid)
                .verifications.create({ to: phone, channel: "sms" })
            return { sid: verification.sid, status: verification.status }
        } catch (error) {
            console.error("Twilio send OTP error:", error)
            throw new Error("Failed to send OTP. Check phone number.")
        }
    }

    async verifyOtp(phone, code) {
        if (!twilioClient) {
            throw new Error("Twilio not configured")
        }
        if (!config.twilio.verifyServiceSid) {
            throw new Error("Twilio Verify service SID not configured")
        }

        try {
            const verificationCheck = await twilioClient.verify.v2
                .services(config.twilio.verifyServiceSid)
                .verificationChecks.create({ to: phone, code })
            return verificationCheck.status === "approved"
        } catch (error) {
            console.error("Twilio verify OTP error:", error)
            return false
        }
    }

    async findOrCreateUserByPhone(phone, name) {
        let user = await User.findOne({ phone })
        if (!user) {
            user = await User.create({
                phone,
                name: name || undefined,
                isPhoneVerified: true,
                status: USER_STATUS.ACTIVE,
            })
        } else {
            user.isPhoneVerified = true
            user.lastLogin = new Date()
            if (name && !user.name) user.name = name
            await user.save()
        }
        return user
    }

    async findOrCreateUserByEmail(email, password, name) {
        let user = await User.findOne({ email })
        if (user) {
            const valid = await user.validatePassword(password)
            if (!valid) throw new Error("Invalid email or password")
        } else {
            user = new User({
                email,
                name: name || email.split("@")[0],
                status: USER_STATUS.ACTIVE,
            })
            await user.setPassword(password)
            await user.save()
        }
        user.lastLogin = new Date()
        await user.save()
        return user
    }

    async findOrCreateUserByGoogle(googleId, email, name) {
        let user = await User.findOne({ $or: [{ googleId }, { email }] })
        if (user) {
            if (!user.googleId) user.googleId = googleId
            if (!user.name && name) user.name = name
            if (!user.email && email) user.email = email
        } else {
            user = await User.create({
                googleId,
                email: email || undefined,
                name: name || "User",
                status: USER_STATUS.ACTIVE,
            })
        }
        user.lastLogin = new Date()
        await user.save()
        return user
    }

    async getUserById(userId) {
        return User.findById(userId)
    }
}

export default new AuthService()
