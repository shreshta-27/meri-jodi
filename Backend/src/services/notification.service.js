import { Notification } from "../models/Notification.js"
import { PAGINATION_DEFAULTS } from "../constants/index.js"

class NotificationService {
    /**
     * Create a notification
     * @param {string} userId
     * @param {string} type
     * @param {string} message
     * @param {string} relatedProfileId
     * @returns {Promise<object>}
     */
    async create(userId, type, message, relatedProfileId = null) {
        const cleanUserId = typeof userId === "object" && userId?._id ? userId._id : userId
        return Notification.create({
            userId: cleanUserId,
            type,
            message,
            relatedProfileId,
        })
    }

    /**
     * Get notifications for a user
     * @param {string} userId
     * @param {object} options - Pagination
     * @returns {Promise<object>}
     */
    async getAll(userId, options = {}) {
        const page = options.page || PAGINATION_DEFAULTS.PAGE
        const limit = Math.min(
            options.limit || PAGINATION_DEFAULTS.LIMIT,
            PAGINATION_DEFAULTS.MAX_LIMIT
        )
        const skip = (page - 1) * limit

        const [notifications, total] = await Promise.all([
            Notification.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("relatedProfileId", "photos gender"),
            Notification.countDocuments({ userId }),
        ])

        return {
            notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    /**
     * Mark a notification as read
     * @param {string} notificationId
     * @param {string} userId
     * @returns {Promise<object|null>}
     */
    async markAsRead(notificationId, userId) {
        return Notification.findOneAndUpdate(
            { _id: notificationId, userId, isRead: false },
            { isRead: true, readAt: new Date() },
            { returnDocument: "after" }
        )
    }

    /**
     * Mark all notifications as read
     * @param {string} userId
     * @returns {Promise<object>}
     */
    async markAllAsRead(userId) {
        return Notification.updateMany(
            { userId, isRead: false },
            { isRead: true, readAt: new Date() }
        )
    }

    /**
     * Get unread count
     * @param {string} userId
     * @returns {Promise<number>}
     */
    async getUnreadCount(userId) {
        return Notification.countDocuments({ userId, isRead: false })
    }
}

export default new NotificationService()
