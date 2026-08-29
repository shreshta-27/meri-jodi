import authService from "../services/auth.service.js"
import { User } from "../models/User.js"
import { USER_STATUS } from "../constants/index.js"

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || ""
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : null

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authorization token missing",
            })
        }

        const decoded = authService.verifyToken(token)
        req.userId = decoded.userId
        next()
    } catch (error) {
        console.error("JWT auth failed:", error.message)
        res.status(401).json({
            success: false,
            message: "Invalid or expired auth token",
        })
    }
}

export const attachUser = async (req, res, next) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            })
        }

        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            })
        }

        if (user.status !== USER_STATUS.ACTIVE) {
            return res.status(403).json({
                success: false,
                message: "Account is inactive or banned",
            })
        }

        req.user = user
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
