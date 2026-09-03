import { Shortlist } from "../models/Shortlist.js"
import { Profile } from "../models/Profile.js"

class ShortlistService {
    /**
     * Toggle shortlist (add if not exists, remove if exists)
     * @param {string} profileId - Profile doing the shortlisting
     * @param {string} shortlistedProfileId - Profile being shortlisted
     * @returns {Promise<object>} { action: 'added' | 'removed', shortlist }
     */
    async toggle(profileId, shortlistedProfileId) {
        if (profileId === shortlistedProfileId) {
            throw new Error("Cannot shortlist yourself")
        }

        const targetProfile = await Profile.findById(shortlistedProfileId)
        if (!targetProfile) {
            throw new Error("Target profile not found or no longer exists")
        }

        const existing = await Shortlist.findOne({
            profileId,
            shortlistedProfileId,
        })

        if (existing) {
            await Shortlist.deleteOne({ _id: existing._id })
            return { action: "removed" }
        }

        const shortlist = await Shortlist.create({
            profileId,
            shortlistedProfileId,
        })
        return { action: "added", shortlist }
    }

    /**
     * Get shortlisted profiles, filtering out deleted/non-existent users
     * @param {string} profileId
     * @returns {Promise<Array>} Shortlisted profiles
     */
    async getShortlisted(profileId) {
        const shortlists = await Shortlist.find({ profileId })
            .sort({ createdAt: -1 })
            .populate({
                path: "shortlistedProfileId",
                select: "name gender location photos aboutMe dateOfBirth religion caste career education lifestyle heightCm isVerified",
                populate: { path: "userId", select: "name avatar" },
            })
            .lean()

        // Filter out records where target profile or user was deleted
        return shortlists.filter(
            (item) => item.shortlistedProfileId && (item.shortlistedProfileId.userId || item.shortlistedProfileId.name)
        )
    }

    /**
     * Check if profile is shortlisted
     * @param {string} profileId
     * @param {string} shortlistedProfileId
     * @returns {Promise<boolean>}
     */
    async isShortlisted(profileId, shortlistedProfileId) {
        const exists = await Shortlist.findOne({
            profileId,
            shortlistedProfileId,
        })
        return !!exists
    }
}

export default new ShortlistService()
