import { Verification } from "../models/Verification.js"
import { Profile } from "../models/Profile.js"
import { Notification } from "../models/Notification.js"
import { PAGINATION_DEFAULTS, NOTIFICATION_TYPE } from "../constants/index.js"

class VerificationService {
    /**
     * Submit a verification document
     * @param {string} profileId
     * @param {string} documentType
     * @param {string} documentUrl
     * @returns {Promise<object>}
     */
    async submit(profileId, documentType, documentUrl) {
        const existing = await Verification.findOne({
            profileId,
            status: { $in: ["submitted", "under_review"] },
        })
        if (existing) {
            throw new Error(
                "You already have a pending verification request"
            )
        }

        return Verification.create({ profileId, documentType, documentUrl })
    }

    /**
     * Get user's verification status by profile ID
     * @param {string} profileId
     * @returns {Promise<object|null>}
     */
    async getByProfileId(profileId) {
        return Verification.findOne({ profileId }).sort({ createdAt: -1 })
    }

    /**
     * Get all verifications (admin)
     * @param {object} options
     * @returns {Promise<object>}
     */
    async getAll(options = {}) {
        const page = options.page || PAGINATION_DEFAULTS.PAGE
        const limit = Math.min(
            options.limit || PAGINATION_DEFAULTS.LIMIT,
            PAGINATION_DEFAULTS.MAX_LIMIT
        )
        const skip = (page - 1) * limit

        const query = {}
        if (options.status) {
            if (options.status === "pending") {
                query.status = { $in: ["submitted", "under_review"] }
            } else {
                query.status = options.status
            }
        }

        const [verifications, total] = await Promise.all([
            Verification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("profileId", "name photos gender location religion caste userId"),
            Verification.countDocuments(query),
        ])

        return {
            verifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    /**
     * Review a verification (admin)
     * @param {string} verificationId
     * @param {string} status - 'verified' or 'rejected'
     * @param {string} reviewNote
     * @returns {Promise<object|null>}
     */
    async review(verificationId, status, reviewNote = "") {
        const verification = await Verification.findByIdAndUpdate(
            verificationId,
            { status, reviewNote, reviewedAt: new Date() },
            { returnDocument: "after" }
        )

        if (!verification) return null

        if (status === "verified" || status === "approved") {
            const profile = await Profile.findByIdAndUpdate(
                verification.profileId,
                { isVerified: true },
                { returnDocument: "after" }
            )
            if (profile?.userId) {
                await Notification.create({
                    userId: profile.userId,
                    type: NOTIFICATION_TYPE.SYSTEM,
                    message: "Congratulations! Your KYC verification document has been approved and your profile is now verified.",
                }).catch(() => {})
            }
        } else if (status === "rejected") {
            const profile = await Profile.findByIdAndUpdate(
                verification.profileId,
                { isVerified: false },
                { returnDocument: "after" }
            )
            if (profile?.userId) {
                await Notification.create({
                    userId: profile.userId,
                    type: NOTIFICATION_TYPE.SYSTEM,
                    message: `Your KYC verification request was not approved${reviewNote ? `: "${reviewNote}"` : ". Please re-upload a clear government ID."}`,
                }).catch(() => {})
            }
        }

        return verification
    }
}

export default new VerificationService()

