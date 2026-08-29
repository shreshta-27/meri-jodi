import jwt from "jsonwebtoken"
import { config } from "../config/config.js"
import { redisClient } from "../config/redis.js"
import { User } from "../models/User.js"
import { USER_STATUS } from "../constants/index.js"

export const authenticate = async (req, res, next) => {
    try {
        let token = null

        // 1. Check Authorization Header (Bearer token)
        const authHeader = req.headers.authorization || ""
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.slice(7).trim()
        }

        // 2. Check HTTP-only Cookie
        if (!token && req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authorization token missing. Please sign in.",
            })
        }

        const decoded = jwt.verify(token, config.jwtSecret)
        const userId = decoded.userId || decoded.id

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload",
            })
        }

        req.userId = userId

        // Check Redis Cache for user
        const cacheKey = `user:${userId}`
        const cachedUserJson = await redisClient.get(cacheKey)

        if (cachedUserJson) {
            try {
                const cachedUser = JSON.parse(cachedUserJson)
                if (cachedUser.status && cachedUser.status !== USER_STATUS.ACTIVE) {
                    return res.status(403).json({
                        success: false,
                        message: "Your account is inactive or banned",
                    })
                }
                req.user = cachedUser
                return next()
            } catch (err) {
                // fall through to DB
            }
        }

        // Fetch from MongoDB if not cached
        const user = await User.findById(userId)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            })
        }

        if (user.status !== USER_STATUS.ACTIVE) {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive or banned",
            })
        }

        const authUser = user.toAuthJSON()
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(authUser))

        req.user = authUser
        next()
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired. Please refresh your session.",
                isExpired: true,
            })
        }
        return res.status(401).json({
            success: false,
            message: "Invalid or expired auth token",
        })
    }
}

export const attachUser = async (req, res, next) => {
    try {
        if (!req.user && req.userId) {
            const user = await User.findById(req.userId)
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found",
                })
            }
            req.user = user.toAuthJSON()
        }
        next()
    } catch (error) {
        next(error)
    }
}

export const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required",
        })
    }
    next()
}
