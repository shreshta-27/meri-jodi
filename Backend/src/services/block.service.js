import { Block } from "../models/Block.js"

class BlockService {
    /**
     * Block a user
     * @param {string} blockerProfileId
     * @param {string} blockedProfileId
     * @returns {Promise<object>}
     */
    async block(blockerProfileId, blockedProfileId) {
        if (blockerProfileId === blockedProfileId) {
            throw new Error("Cannot block yourself")
        }

        const existing = await Block.findOne({
            blockerProfileId,
            blockedProfileId,
        })
        if (existing) {
            throw new Error("User already blocked")
        }

        return Block.create({ blockerProfileId, blockedProfileId })
    }

    /**
     * Unblock a user
     * @param {string} blockerProfileId
     * @param {string} blockedProfileId
     * @returns {Promise<object|null>}
     */
    async unblock(blockerProfileId, blockedProfileId) {
        return Block.findOneAndDelete({ blockerProfileId, blockedProfileId })
    }

    /**
     * Get blocked users
     * @param {string} profileId
     * @returns {Promise<Array>}
     */
    async getBlocked(profileId) {
        return Block.find({ blockerProfileId: profileId })
            .sort({ createdAt: -1 })
            .populate("blockedProfileId", "gender location photos")
    }

    /**
     * Check if user is blocked
     * @param {string} blockerProfileId
     * @param {string} blockedProfileId
     * @returns {Promise<boolean>}
     */
    async isBlocked(blockerProfileId, blockedProfileId) {
        const exists = await Block.findOne({
            blockerProfileId,
            blockedProfileId,
        })
        return !!exists
    }

    /**
     * Check if either user has blocked the other
     * @param {string} profileId1
     * @param {string} profileId2
     * @returns {Promise<boolean>}
     */
    async isEitherBlocked(profileId1, profileId2) {
        const exists = await Block.findOne({
            $or: [
                { blockerProfileId: profileId1, blockedProfileId: profileId2 },
                { blockerProfileId: profileId2, blockedProfileId: profileId1 },
            ],
        })
        return !!exists
    }
}

export default new BlockService()
