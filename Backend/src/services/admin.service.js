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
import { USER_STATUS, ROLES, NOTIFICATION_TYPE, PAGINATION_DEFAULTS } from "../constants/index.js"
import { redisClient } from "../config/redis.js"
import { revokeRefreshToken } from "../config/generateToken.js"

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
                .select("name email phone role status isEmailVerified isPhoneVerified createdAt lastLogin"),
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
     * Get paginated users directory with advanced cross-model filtering and search
     */
    async getUsers(options = {}) {
        const page = Math.max(1, parseInt(options.page, 10) || PAGINATION_DEFAULTS.PAGE)
        const limit = Math.min(
            Math.max(1, parseInt(options.limit, 10) || PAGINATION_DEFAULTS.LIMIT),
            100
        )
        const skip = (page - 1) * limit
        const { search, status, role, isVerified, gender, sortBy = "createdAt", sortOrder = "desc" } = options

        const matchConditions = []

        if (status && Object.values(USER_STATUS).includes(status)) {
            matchConditions.push({ status })
        }
        if (role && Object.values(ROLES).includes(role)) {
            matchConditions.push({ role })
        }

        if (isVerified !== undefined && isVerified !== "" && isVerified !== "all") {
            const verifiedBool = isVerified === "true" || isVerified === true
            matchConditions.push({ "profile.isVerified": verifiedBool })
        }
        if (gender && gender !== "all") {
            matchConditions.push({ "profile.gender": gender.toLowerCase() })
        }

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), "i")
            matchConditions.push({
                $or: [
                    { name: regex },
                    { email: regex },
                    { phone: regex },
                    { "profile.name": regex },
                    { "profile.location.city": regex },
                    { "profile.location.state": regex },
                    { "profile.career.occupation": regex },
                    { "profile.religion": regex },
                    { "profile.caste": regex },
                ],
            })
        }

        const matchStage = matchConditions.length > 0 ? { $match: { $and: matchConditions } } : { $match: {} }

        const sortDirection = sortOrder === "asc" ? 1 : -1
        const sortField = sortBy === "name" ? "name" : sortBy === "lastLogin" ? "lastLogin" : "createdAt"

        const pipeline = [
            {
                $lookup: {
                    from: "profiles",
                    localField: "_id",
                    foreignField: "userId",
                    as: "profile",
                },
            },
            {
                $unwind: {
                    path: "$profile",
                    preserveNullAndEmptyArrays: true,
                },
            },
            matchStage,
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $sort: { [sortField]: sortDirection } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                name: { $ifNull: ["$name", "$profile.name", "MeriJodi Member"] },
                                email: 1,
                                phone: 1,
                                avatar: 1,
                                role: 1,
                                status: 1,
                                isEmailVerified: 1,
                                isPhoneVerified: 1,
                                lastLogin: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                profile: 1,
                                isVerified: { $ifNull: ["$profile.isVerified", false] },
                                profileCompletionPct: { $ifNull: ["$profile.profileCompletionPct", 0] },
                                gender: { $ifNull: ["$profile.gender", "—"] },
                                location: "$profile.location",
                                career: "$profile.career",
                            },
                        },
                    ],
                },
            },
        ]

        const [aggregationResult] = await User.aggregate(pipeline)
        const total = aggregationResult?.metadata?.[0]?.total || 0
        const users = aggregationResult?.data || []

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
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

        const profile = await Profile.findOne({ userId })
        const profileId = profile?._id
        const preferences = profileId ? await PartnerPreference.findOne({ profileId }) : null

        const [verifications, reportsAgainst, reportsBy] = await Promise.all([
            profileId ? Verification.find({ profileId }).sort({ createdAt: -1 }) : [],
            profileId ? Report.find({ reportedProfileId: profileId }).sort({ createdAt: -1 }) : [],
            profileId ? Report.find({ reporterProfileId: profileId }).sort({ createdAt: -1 }) : [],
        ])

        return {
            user: {
                ...user.toAuthJSON(),
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastLogin: user.lastLogin,
            },
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

        // If banned, revoke refresh token sessions
        if (status === USER_STATUS.BANNED) {
            await revokeRefreshToken(userId).catch(() => {})
        }

        return {
            ...user.toAuthJSON(),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLogin: user.lastLogin,
        }
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
        return {
            ...user.toAuthJSON(),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLogin: user.lastLogin,
        }
    }

    /**
     * Toggle or set user profile verification badge
     */
    async toggleUserVerification(userId, isVerified) {
        const verifiedVal = Boolean(isVerified)

        const user = await User.findById(userId)
        if (!user) {
            const error = new Error("User not found")
            error.statusCode = 404
            throw error
        }

        const profile = await Profile.findOneAndUpdate(
            { userId },
            { 
                userId,
                name: user.name,
                gender: user.gender || "male",
                isVerified: verifiedVal, 
                updatedAt: new Date() 
            },
            { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
        )

        // Send a real-time system notification
        await Notification.create({
            userId,
            type: NOTIFICATION_TYPE.SYSTEM,
            message: verifiedVal
                ? "Congratulations! Your profile has been granted the Verified Member badge."
                : "Your profile verification status has been updated by administration.",
        }).catch(() => {})

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
            profileId ? PartnerPreference.findOneAndDelete({ profileId }) : Promise.resolve(),
            Notification.deleteMany({ userId }),
            profileId ? Verification.deleteMany({ profileId }) : Promise.resolve(),
            profileId ? Report.deleteMany({ $or: [{ reporterProfileId: profileId }, { reportedProfileId: profileId }] }) : Promise.resolve(),
            profileId ? Interest.deleteMany({ $or: [{ senderProfileId: profileId }, { receiverProfileId: profileId }] }) : Promise.resolve(),
            profileId ? Message.deleteMany({ $or: [{ senderProfileId: profileId }, { receiverProfileId: profileId }] }) : Promise.resolve(),
            profileId ? Shortlist.deleteMany({ $or: [{ profileId }, { shortlistedProfileId: profileId }] }) : Promise.resolve(),
            profileId ? Block.deleteMany({ $or: [{ blockerProfileId: profileId }, { blockedProfileId: profileId }] }) : Promise.resolve(),
            redisClient.del(`user:${userId}`),
            revokeRefreshToken(userId).catch(() => {}),
        ])

        return { message: "User and associated data permanently removed." }
    }
}

const adminService = new AdminService()
export { adminService }
export default adminService
