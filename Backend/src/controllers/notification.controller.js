import BaseController from "./base.controller.js"
import notificationService from "../services/notification.service.js"

class NotificationController extends BaseController {
    async getNotifications(req, res, next) {
        try {
            const result = await notificationService.getAll(
                req.user._id,
                {
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 20,
                }
            )
            return this.sendSuccess(
                res,
                result,
                "Notifications retrieved"
            )
        } catch (error) {
            next(error)
        }
    }

    async markAsRead(req, res, next) {
        try {
            const notification = await notificationService.markAsRead(
                req.params.id,
                req.user._id
            )
            return this.sendSuccess(
                res,
                notification,
                "Notification marked as read"
            )
        } catch (error) {
            next(error)
        }
    }

    async getUnreadCount(req, res, next) {
        try {
            const count = await notificationService.getUnreadCount(req.user._id)
            return this.sendSuccess(res, { unreadCount: count }, "Unread count retrieved")
        } catch (error) {
            next(error)
        }
    }

    async markAllAsRead(req, res, next) {
        try {
            await notificationService.markAllAsRead(req.user._id)
            return this.sendSuccess(
                res,
                null,
                "All notifications marked as read"
            )
        } catch (error) {
            next(error)
        }
    }
}

export default new NotificationController()
