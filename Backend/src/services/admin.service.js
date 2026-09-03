import { User } from "../models/User.js"
import { Profile } from "../models/Profile.js"
import { Verification } from "../models/Verification.js"
import { Report } from "../models/Report.js"
import { Interest } from "../models/Interest.js"
import { Message } from "../models/Message.js"
import { PartnerPreference } from "../models/PartnerPreference.js"
import { Notification } from "../models/Notification.js"
import { Shortlist } from "../models/Shortlist.js"
import { Block } from "../models/Block.js"
import { USER_STATUS, ROLES, PAGINATION_DEFAULTS } from "../constants/index.js"
import { redisClient } from "../config/redis.js"

class AdminService {
    /**
     * Get platform overview KPIs and dynamic statistics
     */
    async getDashboardStats() {
        const [
            totalUsers,
            activeUsers,
            bannedUsers,
            totalProfiles,
            verifiedProfiles,
            pendingVerifications,
            totalVerifications,
            pendingReports,
            totalReports,
            totalInterests,
            acceptedInterests,
            totalMessages,
            maleProfiles,
            femaleProfiles,
            recentUsers,
            recentVerifications,
            recentReports,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ status: USER_STATUS.ACTIVE }),
            User.countDocuments({ status: USER_STATUS.BANNED }),
            Profile.countDocuments(),
            Profile.countDocuments({ isVerified: true }),
            Verification.countDocuments({ status: { $in: ["submitted", "under_review"] } }),
            Verification.countDocuments(),
            Report.countDocuments({ status: "pending" }),
            Report.countDocuments(),
            Interest.countDocuments(),
            Interest.countDocuments({ status: "accepted" }),
            Message.countDocuments(),
            Profile.countDocuments({ gender: "male" }),
            Profile.countDocuments({ gender: "female" }),
            User.find()
                .sort({ createdAt: -1 })
                .limit(6)
                .select("name email phone role status isEmailVerified isPhoneVerified createdAt"),
            Verification.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("profileId", "name gender location photos"),
            Report.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("reporterProfileId", "name")
                .populate("reportedProfileId", "name"),
        ])

        // Attach profile data to recent users
        const recentUsersWithProfiles = await Promise.all(
            recentUsers.map(async (u) => {
                const profile = await Profile.findOne({ userId: u._id }).select(
                    "gender location profileCompletionPct isVerified photos"
                )
                return {
                    ...u.toObject(),
                    profile: profile || null,
                }
            })
        )

        return {
            counts: {
                totalUsers,
                activeUsers,
                bannedUsers,
                totalProfiles,
                verifiedProfiles,
                pendingVerifications,
                totalVerifications,
                pendingReports,
                totalReports,
                totalInterests,
                acceptedInterests,
                totalMessages,
            },
            demographics: {
                male: maleProfiles,
                female: femaleProfiles,
                other: Math.max(0, totalProfiles - maleProfiles - femaleProfiles),
            },
            recentActivity: {
                users: recentUsersWithProfiles,
                verifications: recentVerifications,
                reports: recentReports,
            },
            systemHealth: {
                status: "operational",
                database: "connected",
                timestamp: new Date(),
            },
        }
    }

    /**
     * Get paginated users directory with advanced filtering and search
     */
    async getUsers(options = {}) {
        const page = parseInt(options.page, 10) || PAGINATION_DEFAULTS.PAGE
        const limit = Math.min(
            parseInt(options.limit, 10) || PAGINATION_DEFAULTS.LIMIT,
            100
        )
        const skip = (page - 1) * limit
        const { search, status, role, isVerified, gender, sortBy = "createdAt", sortOrder = "desc" } = options

        const userQuery = {}
        if (status && Object.values(USER_STATUS).includes(status)) {
            userQuery.status = status
        }
        if (role && Object.values(ROLES).includes(role)) {
            userQuery.role = role
        }
        if (search) {
            const regex = new RegExp(search.trim(), "i")
            userQuery.$or = [{ name: regex }, { email: regex }, { phone: regex }]
        }

        const sortDirection = sortOrder === "asc" ? 1 : -1
        const sortOptions = { [sortBy]: sortDirection }

        const [users, total] = await Promise.all([
            User.find(userQuery)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .select("name email phone avatar role status isEmailVerified isPhoneVerified lastLogin createdAt updatedAt"),
            User.countDocuments(userQuery),
        ])

        // Attach corresponding profiles
        const userIds = users.map((u) => u._id)
        const profileQuery = { userId: { $in: userIds } }
        if (isVerified !== undefined && isVerified !== "") {
            profileQuery.isVerified = isVerified === "true" || isVerified === true
        }
        if (gender) {
            profileQuery.gender = gender.toLowerCase()
        }

        const profiles = await Profile.find(profileQuery).lean()
        const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]))

        const results = users
            .map((u) => {
                const p = profileMap.get(u._id.toString())
                if (gender || isVerified !== undefined && isVerified !== "") {
                    if (!p) return null
                }
                return {
                    _id: u._id,
                    name: u.name || p?.name || "MeriJodi Member",
                    email: u.email,
                    phone: u.phone,
                    avatar: u.avatar,
                    role: u.role,
                    status: u.status,
                    isEmailVerified: u.isEmailVerified,
                    isPhoneVerified: u.isPhoneVerified,
                    lastLogin: u.lastLogin,
                    createdAt: u.createdAt,
                    profile: p || null,
                    isVerified: Boolean(p?.isVerified),
                    profileCompletionPct: p?.profileCompletionPct || 0,
                    gender: p?.gender || "—",
                    location: p?.location || null,
                    career: p?.career || null,
                }
            })
            .filter(Boolean)

        return {
            users: results,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    /**
     * Get single user's detailed dossier
     */
    async getUserById(userId) {
        const user = await User.findById(userId)
        if (!user) {
            const error = new Error("User not found")
            error.statusCode = 404
            throw error
        }

        const [profile, preferences, verifications, reportsAgainst, reportsBy] = await Promise.all([
            Profile.findOne({ userId }),
            PartnerPreference.findOne({ userId }),
            Verification.find({ profileId: profile?._id }).sort({ createdAt: -1 }),
            profile ? Report.find({ reportedProfileId: profile._id }).sort({ createdAt: -1 }) : [],
            profile ? Report.find({ reporterProfileId: profile._id }).sort({ createdAt: -1 }) : [],
        ])

        return {
            user: user.toAuthJSON(),
            profile,
            preferences,
            verifications,
            reportsAgainst,
            reportsBy,
        }
    }

    /**
     * Update user status (active, inactive, banned)
     */
    async updateUserStatus(userId, status) {
        if (!Object.values(USER_STATUS).includes(status)) {
            const error = new Error(`Invalid status: ${status}`)
            error.statusCode = 400
            throw error
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { status, updatedAt: new Date() },
            { returnDocument: "after" }
        )

        if (!user) {
            const error = new Error("User not found")
            error.statusCode = 404
            throw error
        }

        // Invalidate Redis user cache
        await redisClient.del(`user:${userId}`)

        return user.toAuthJSON()
    }

    /**
     * Update user role (user, admin)
     */
    async updateUserRole(userId, role) {
        if (!Object.values(ROLES).includes(role)) {
            const error = new Error(`Invalid role: ${role}`)
            error.statusCode = 400
            throw error
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role, updatedAt: new Date() },
            { returnDocument: "after" }
        )

        if (!user) {
            const error = new Error("User not found")
            error.statusCode = 404
            throw error
        }

        await redisClient.del(`user:${userId}`)
        return user.toAuthJSON()
    }

    /**
     * Toggle or set user profile verification badge
     */
    async toggleUserVerification(userId, isVerified) {
        const verifiedVal = Boolean(isVerified)

        const profile = await Profile.findOneAndUpdate(
            { userId },
            { isVerified: verifiedVal, updatedAt: new Date() },
            { returnDocument: "after" }
        )

        if (!profile) {
            const error = new Error("User profile not found")
            error.statusCode = 404
            throw error
        }

        return profile
    }

    /**
     * Permanently delete user and all associated documents
     */
    async deleteUser(userId) {
        const user = await User.findById(userId)
        if (!user) {
            const error = new Error("User not found")
            error.statusCode = 404
            throw error
        }

        const profile = await Profile.findOne({ userId })
        const profileId = profile?._id

        await Promise.all([
            User.findByIdAndDelete(userId),
            Profile.findOneAndDelete({ userId }),
            PartnerPreference.findOneAndDelete({ userId }),
            Notification.deleteMany({ userId }),
            profileId ? Verification.deleteMany({ profileId }) : Promise.resolve(),
            profileId ? Report.deleteMany({ $or: [{ reporterProfileId: profileId }, { reportedProfileId: profileId }] }) : Promise.resolve(),
            profileId ? Interest.deleteMany({ $or: [{ senderProfileId: profileId }, { receiverProfileId: profileId }] }) : Promise.resolve(),
            profileId ? Message.deleteMany({ $or: [{ senderProfileId: profileId }, { receiverProfileId: profileId }] }) : Promise.resolve(),
            profileId ? Shortlist.deleteMany({ $or: [{ profileId }, { shortlistedProfileId: profileId }] }) : Promise.resolve(),
            profileId ? Block.deleteMany({ $or: [{ blockerProfileId: profileId }, { blockedProfileId: profileId }] }) : Promise.resolve(),
            redisClient.del(`user:${userId}`),
        ])

        return { message: "User and associated data permanently removed." }
    }
}

const adminService = new AdminService()
export { adminService }
export default adminService
