import mongoose from "mongoose"
import { Message } from "../models/Message.js"
import { Block } from "../models/Block.js"

class MessageService {
    /**
     * Send a message
     * @param {string} senderProfileId
     * @param {string} receiverProfileId
     * @param {string} content
     * @returns {Promise<object>} Created message
     */
    async send(senderProfileId, receiverProfileId, content) {
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
            throw new Error("Cannot send message to this user")
        }

        return Message.create({ senderProfileId, receiverProfileId, content })
    }

    /**
     * Get conversation between two profiles
     * @param {string} profileId1
     * @param {string} profileId2
     * @param {object} options - Pagination
     * @returns {Promise<Array>} Messages
     */
    async getConversation(profileId1, profileId2, options = {}) {
        const page = options.page || 1
        const limit = options.limit || 50
        const skip = (page - 1) * limit

        return Message.find({
            $or: [
                {
                    senderProfileId: profileId1,
                    receiverProfileId: profileId2,
                },
                {
                    senderProfileId: profileId2,
                    receiverProfileId: profileId1,
                },
            ],
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("senderProfileId", "photos")
            .populate("receiverProfileId", "photos")
    }

    /**
     * Mark a message as read
     * @param {string} messageId
     * @param {string} profileId - Receiver's profile ID
     * @returns {Promise<object|null>}
     */
    async markAsRead(messageId, profileId) {
        return Message.findOneAndUpdate(
            { _id: messageId, receiverProfileId: profileId, isRead: false },
            { isRead: true, readAt: new Date() },
            { returnDocument: "after" }
        )
    }

    /**
     * Get all conversations for a profile
     * @param {string} profileId
     * @returns {Promise<Array>} Latest message from each conversation
     */
    async getConversations(profileId) {
        const objectId = new mongoose.Types.ObjectId(profileId)

        const pipeline = [
            {
                $match: {
                    $or: [
                        { senderProfileId: objectId },
                        { receiverProfileId: objectId },
                    ],
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderProfileId", objectId] },
                            "$receiverProfileId",
                            "$senderProfileId",
                        ],
                    },
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        {
                                            $eq: [
                                                "$receiverProfileId",
                                                objectId,
                                            ],
                                        },
                                        { $eq: ["$isRead", false] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            { $sort: { "lastMessage.createdAt": -1 } },
        ]

        return Message.aggregate(pipeline)
    }

    /**
     * Get unread message count
     * @param {string} profileId
     * @returns {Promise<number>}
     */
    async getUnreadCount(profileId) {
        return Message.countDocuments({
            receiverProfileId: profileId,
            isRead: false,
        })
    }
}

export default new MessageService()
