import { Interest } from "../models/Interest.js"
import { Block } from "../models/Block.js"

class InterestService {
    /**
     * Send an interest
     * @param {string} senderProfileId
     * @param {string} receiverProfileId
     * @returns {Promise<object>} Created interest (or matched interest if mutual)
     */
    async send(senderProfileId, receiverProfileId) {
        // Check if blocked
        const blocked = await Block.findOne({
            $or: [
                {
                    blockerProfileId: receiverProfileId,
                    blockedProfileId: senderProfileId,
                },
                {
                    blockerProfileId: senderProfileId,
                    blockedProfileId: receiverProfileId,
                },
            ],
        })
        if (blocked) {
            throw new Error("Cannot send interest to this user")
        }

        // Check for existing active interest from sender (not withdrawn)
        const existing = await Interest.findOne({
            senderProfileId,
            receiverProfileId,
            status: { $ne: "withdrawn" },
        })
        if (existing) {
            throw new Error("Interest already sent")
        }

        // Delete any withdrawn interest to free up the unique index
        await Interest.deleteOne({
            senderProfileId,
            receiverProfileId,
            status: "withdrawn",
        })

        // Check for mutual interest (receiver already sent to sender)
        const reverseInterest = await Interest.findOne({
            senderProfileId: receiverProfileId,
            receiverProfileId: senderProfileId,
            status: "pending",
        })

        if (reverseInterest) {
            // Auto-accept both interests (mutual match)
            reverseInterest.status = "accepted"
            reverseInterest.respondedAt = new Date()
            await reverseInterest.save()

            const newInterest = await Interest.create({
                senderProfileId,
                receiverProfileId,
                status: "accepted",
                respondedAt: new Date(),
            })

            return { interest: newInterest, isMutual: true }
        }

        const interest = await Interest.create({ senderProfileId, receiverProfileId })
        return { interest, isMutual: false }
    }

    /**
     * Respond to an interest (accept/decline)
     * @param {string} interestId
     * @param {string} profileId - Receiver's profile ID
     * @param {string} status - 'accepted' or 'declined'
     * @returns {Promise<object>} Updated interest
     */
    async respond(interestId, profileId, status) {
        const interest = await Interest.findOne({
            _id: interestId,
            receiverProfileId: profileId,
            status: "pending",
        })

        if (!interest) {
            throw new Error("Interest not found or already responded")
        }

        interest.status = status
        interest.respondedAt = new Date()
        await interest.save()
        return interest
    }

    /**
     * Withdraw a sent interest
     * @param {string} interestId
     * @param {string} profileId - Sender's profile ID
     * @returns {Promise<object>} Updated interest
     */
    async withdraw(interestId, profileId) {
        const interest = await Interest.findOne({
            _id: interestId,
            senderProfileId: profileId,
            status: "pending",
        })

        if (!interest) {
            throw new Error("Interest not found or already processed")
        }

        interest.status = "withdrawn"
        await interest.save()
        return interest
    }

    /**
     * Get sent interests
     * @param {string} profileId
     * @returns {Promise<Array>} Sent interests
     */
    async getSent(profileId) {
        return Interest.find({ senderProfileId: profileId })
            .sort({ createdAt: -1 })
            .populate("receiverProfileId", "gender location photos")
    }

    /**
     * Get received interests
     * @param {string} profileId
     * @returns {Promise<Array>} Received interests
     */
    async getReceived(profileId) {
        return Interest.find({ receiverProfileId: profileId })
            .sort({ createdAt: -1 })
            .populate("senderProfileId", "gender location photos")
    }

    /**
     * Check if interest exists between two profiles
     * @param {string} senderProfileId
     * @param {string} receiverProfileId
     * @returns {Promise<object|null>}
     */
    async findBetween(senderProfileId, receiverProfileId) {
        return Interest.findOne({ senderProfileId, receiverProfileId })
    }
}

export default new InterestService()
