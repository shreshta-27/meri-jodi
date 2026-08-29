import { Shortlist } from "../models/Shortlist.js"

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
     * Get shortlisted profiles
     * @param {string} profileId
     * @returns {Promise<Array>} Shortlisted profiles
     */
    async getShortlisted(profileId) {
        return Shortlist.find({ profileId })
            .sort({ createdAt: -1 })
            .populate("shortlistedProfileId", "gender location photos aboutMe")
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
