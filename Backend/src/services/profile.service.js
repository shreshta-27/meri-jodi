import mongoose from "mongoose"
import { Profile } from "../models/Profile.js"
import { User } from "../models/User.js"
import { ProfileView } from "../models/ProfileView.js"
import notificationService from "./notification.service.js"
import { PAGINATION_DEFAULTS } from "../constants/index.js"

const PROFILE_CREATE_FIELDS = [
    "name",
    "dateOfBirth",
    "placeOfBirth",
    "motherTongue",
    "gender",
    "aboutMe",
    "heightCm",
    "religion",
    "caste",
    "gotham",
    "rashi",
    "nakshtra",
    "manglik",
    "complexion",
    "maritalStatus",
    "location",
    "education",
    "career",
    "family",
    "lifestyle",
    "hobbiesAndInterests",
    "createdBy",
    "agreedToTerms",
    "agreedToPrivacyPolicy",
    "termsAgreedAt",
]

const PROFILE_UPDATE_FIELDS = [
    "name",
    "dateOfBirth",
    "placeOfBirth",
    "motherTongue",
    "gender",
    "aboutMe",
    "heightCm",
    "religion",
    "caste",
    "gotham",
    "rashi",
    "nakshtra",
    "manglik",
    "complexion",
    "maritalStatus",
    "location",
    "education",
    "career",
    "family",
    "lifestyle",
    "hobbiesAndInterests",
    "createdBy",
    "agreedToTerms",
    "agreedToPrivacyPolicy",
    "termsAgreedAt",
]

class ProfileService {
    /**
     * Create a new profile
     * @param {string} userId - User ID
     * @param {object} data - Profile data
     * @returns {Promise<object>} Created profile
     */
    async create(userId, data) {
        const sanitized = {}
        for (const field of PROFILE_CREATE_FIELDS) {
            if (data[field] !== undefined) {
                sanitized[field] = data[field]
            }
        }

        if (!sanitized.name) {
            const user = await User.findById(userId)
            if (user && user.name) sanitized.name = user.name
        }

        const profile = new Profile({ userId, ...sanitized })
        profile.profileCompletionPct = this._calculateCompletion(profile)
        await profile.save()
        return profile
    }

    /**
     * Get profile by user ID
     * @param {string} userId - User ID
     * @returns {Promise<object|null>} Profile or null
     */
    async getByUserId(userId) {
        return Profile.findOne({ userId }).populate("userId", "name email phone avatar")
    }

    /**
     * Get profile by ID
     * @param {string} id - Profile ID
     * @returns {Promise<object|null>} Profile or null
     */
    async getById(id) {
        return Profile.findById(id).populate("userId", "name email phone avatar")
    }

    /**
     * Update profile (whitelisted fields only)
     * @param {string} userId - User ID
     * @param {object} data - Update data
     * @returns {Promise<object>} Updated profile
     */
    async update(userId, data) {
        const sanitized = {}
        for (const field of PROFILE_UPDATE_FIELDS) {
            if (data[field] !== undefined) {
                sanitized[field] = data[field]
            }
        }

        if (sanitized.name) {
            await User.findByIdAndUpdate(userId, { name: sanitized.name.trim() })
        }

        // Build atomic $set object with dot-notation for nested fields to prevent field obliteration
        const updateSet = {}
        for (const [key, val] of Object.entries(sanitized)) {
            if (val === undefined) continue

            if (["location", "education", "career", "family", "lifestyle"].includes(key) && val && typeof val === "object" && !Array.isArray(val)) {
                for (let [subKey, subVal] of Object.entries(val)) {
                    if (subVal === undefined) continue
                    if (typeof subVal === "string") subVal = subVal.trim()

                    // Normalize nested enum & numeric fields
                    if (key === "family") {
                        if (subKey === "familyAffluence") {
                            if (!subVal) continue
                            if (subVal === "middle_class") subVal = "middle"
                            else if (subVal === "upper_middle_class") subVal = "upper_middle"
                            else if (subVal === "rich_affluent") subVal = "affluent"
                            else if (subVal === "lower_middle_class") subVal = "lower_middle"
                        }
                        if (subKey === "familyType") {
                            if (!subVal) continue
                            if (subVal === "other") subVal = "extended"
                        }
                        if (subKey === "familyValues" && !subVal) continue
                        if (subKey === "numBrothers" || subKey === "numSisters") {
                            subVal = (subVal === "" || subVal === null) ? 0 : Number(subVal) || 0
                        }
                    } else if (key === "education") {
                        if (subKey === "graduationYear") {
                            if (!subVal) continue
                            subVal = Number(subVal)
                            if (isNaN(subVal)) continue
                        }
                    } else if (key === "location" && subKey === "willingToRelocate") {
                        subVal = subVal === true || subVal === "true"
                    } else if (key === "lifestyle") {
                        if (subKey === "smoking" || subKey === "drinking") {
                            subVal = subVal === true || subVal === "true"
                        }
                    }

                    updateSet[`${key}.${subKey}`] = subVal
                }
            } else {
                let topVal = val
                if (typeof topVal === "string") {
                    topVal = topVal.trim()
                    if (topVal === "" && ["maritalStatus", "gender", "createdBy"].includes(key)) {
                        continue
                    }
                    if (key === "maritalStatus") {
                        if (topVal === "never" || topVal.toLowerCase() === "never married") {
                            topVal = "never_married"
                        }
                    }
                }
                updateSet[key] = topVal
            }
        }

        const profile = await Profile.findOneAndUpdate(
            { userId },
            { $set: updateSet },
            { returnDocument: "after", runValidators: true }
        ).populate("userId", "name email phone avatar")

        if (profile) {
            profile.profileCompletionPct = this._calculateCompletion(profile)
            await profile.save()
        }
        return profile
    }

    /**
     * Search profiles with filters
     * @param {object} filters - Search filters
     * @param {object} options - Pagination options
     * @returns {Promise<object>} Search results with pagination
     */
    async search(filters = {}, options = {}) {
        // Cross-validation: minAge <= maxAge
        if (filters.minAge && filters.maxAge && Number(filters.minAge) > Number(filters.maxAge)) {
            throw new Error("Minimum age must be less than or equal to maximum age")
        }

        const page = options.page || PAGINATION_DEFAULTS.PAGE
        const limit = Math.min(
            options.limit || PAGINATION_DEFAULTS.LIMIT,
            PAGINATION_DEFAULTS.MAX_LIMIT
        )
        const skip = (page - 1) * limit

        const query = {}

        if (filters.religion) query.religion = filters.religion
        if (filters.caste) query.caste = filters.caste
        if (filters.gender) query.gender = filters.gender
        if (filters.maritalStatus) query.maritalStatus = filters.maritalStatus
        if (filters.city) query["location.city"] = filters.city
        if (filters.state) query["location.state"] = filters.state

        // Age filter
        if (filters.minAge || filters.maxAge) {
            const now = new Date()
            if (filters.maxAge) {
                query.dateOfBirth = {
                    ...query.dateOfBirth,
                    $gte: new Date(
                        now.getFullYear() - filters.maxAge,
                        now.getMonth(),
                        now.getDate()
                    ),
                }
            }
            if (filters.minAge) {
                query.dateOfBirth = {
                    ...query.dateOfBirth,
                    $lte: new Date(
                        now.getFullYear() - filters.minAge,
                        now.getMonth(),
                        now.getDate()
                    ),
                }
            }
        }

        // Exclude user's own profile
        if (options.excludeUserId) {
            query.userId = { $ne: options.excludeUserId }
        }

        const [profiles, total] = await Promise.all([
            Profile.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("userId", "name avatar")
                .lean(),
            Profile.countDocuments(query),
        ])

        return {
            profiles: profiles.map((p) => ({
                ...p,
                name: p.name || p.userId?.name || "MeriJodi Member",
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    /**
     * Get primary photo for a profile
     * @param {object} profile - Profile document
     * @returns {object|null} Primary photo or first photo
     */
    getPrimaryPhoto(profile) {
        if (!profile.photos || profile.photos.length === 0) return null
        return (
            profile.photos.find((p) => p.isPrimary) || profile.photos[0]
        )
    }

    /**
     * Get User ID from a Profile document
     * @param {string|object} profileId - Profile ID or profile document
     * @returns {Promise<string|null>} User ID or null
     */
    async getUserIdFromProfile(profileOrId) {
        if (!profileOrId) return null
        let profile = profileOrId
        if (typeof profileOrId === "string" || profileOrId instanceof mongoose.Types.ObjectId) {
            profile = await Profile.findById(profileOrId)
        }
        if (!profile || !profile.userId) return null
        const uId = typeof profile.userId === "object" && profile.userId._id ? profile.userId._id : profile.userId
        return uId.toString()
    }

    /**
     * Calculate profile completion percentage
     * @param {object} profile - Profile document
     * @returns {number} Completion percentage
     */
    _calculateCompletion(profile) {
        const fields = [
            "dateOfBirth",
            "gender",
            "heightCm",
            "religion",
            "caste",
            "maritalStatus",
            "aboutMe",
            "motherTongue",
        ]

        const nestedFields = {
            location: ["city", "state", "country"],
            education: ["highestDegree", "fieldOfStudy", "institution"],
            career: ["occupation", "companyName", "annualIncome"],
            family: [
                "fatherOccupation",
                "motherOccupation",
                "familyType",
                "familyValues",
            ],
        }

        let filled = 0
        let total = fields.length

        for (const field of fields) {
            if (profile[field]) filled++
        }

        for (const [group, subfields] of Object.entries(nestedFields)) {
            for (const subfield of subfields) {
                total++
                if (profile[group] && profile[group][subfield]) filled++
            }
        }

        // Photos
        total++
        if (profile.photos && profile.photos.length > 0) filled++

        // Hobbies
        total++
        if (profile.hobbiesAndInterests && profile.hobbiesAndInterests.length > 0) filled++

        return Math.round((filled / total) * 100)
    }

    async recordView(viewerUserId, targetProfileId) {
        try {
            if (!viewerUserId || !targetProfileId) return null
            const viewerProfile = await Profile.findOne({ userId: viewerUserId })
            if (!viewerProfile) return null

            // Do not record self views
            if (viewerProfile._id.toString() === targetProfileId.toString()) {
                return null
            }

            const targetProfile = await Profile.findById(targetProfileId)
            if (!targetProfile) return null

            const existing = await ProfileView.findOne({
                viewerProfileId: viewerProfile._id,
                viewedProfileId: targetProfileId,
            })

            const updatedView = await ProfileView.findOneAndUpdate(
                {
                    viewerProfileId: viewerProfile._id,
                    viewedProfileId: targetProfileId,
                },
                { lastViewedAt: new Date() },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )

            // Notify target profile if not notified within the last 6 hours
            if (targetProfile.userId) {
                const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000)
                if (!existing || !existing.lastViewedAt || existing.lastViewedAt < sixHoursAgo) {
                    await notificationService.create(
                        targetProfile.userId,
                        "profile_viewed",
                        `${viewerProfile.name || "A verified member"} viewed your profile.`,
                        viewerProfile._id
                    ).catch(() => {})
                }
            }

            return updatedView
        } catch (err) {
            console.error("Failed to record profile view:", err.message)
            return null
        }
    }

    async getWhoViewedMe(userId, limit = 10) {
        const myProfile = await Profile.findOne({ userId })
        if (!myProfile) return []

        const views = await ProfileView.find({ viewedProfileId: myProfile._id })
            .sort({ lastViewedAt: -1 })
            .limit(limit)
            .populate({
                path: "viewerProfileId",
                select: "name dateOfBirth location career religion caste photos isVerified profileCompletionPct gender",
                populate: { path: "userId", select: "name" },
            })

        return views
            .filter((v) => v.viewerProfileId)
            .map((v) => ({
                _id: v._id,
                viewedAt: v.lastViewedAt || v.updatedAt || v.createdAt,
                profile: v.viewerProfileId,
            }))
    }
}

export default new ProfileService()
