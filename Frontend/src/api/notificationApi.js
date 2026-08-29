import axiosInstance from "./axiosInstance"

const NOTIFICATION_BASE = "/notifications"

const unwrap = (response) => response.data?.data ?? response.data

/**
 * Get all notifications for logged-in user with pagination
 * @param {object} params - { page, limit }
 */
export const getNotifications = async (params = {}) => {
    try {
        const response = await axiosInstance.get(NOTIFICATION_BASE, { params })
        return unwrap(response)
    } catch (err) {
        console.error("Failed to fetch notifications:", err)
        return { notifications: [], pagination: { total: 0 } }
    }
}

/**
 * Mark a single notification as read
 * @param {string} notificationId
 */
export const markNotificationRead = async (notificationId) => {
    const response = await axiosInstance.put(`${NOTIFICATION_BASE}/${notificationId}/read`)
    return unwrap(response)
}

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async () => {
    const response = await axiosInstance.put(`${NOTIFICATION_BASE}/read-all`)
    return unwrap(response)
}

/**
 * Get unread notifications count
 */
export const getUnreadNotificationCount = async () => {
    try {
        const response = await axiosInstance.get(`${NOTIFICATION_BASE}/unread-count`)
        const data = unwrap(response)
        return data?.unreadCount ?? data?.count ?? (typeof data === "number" ? data : 0)
    } catch {
        return 0
    }
}
