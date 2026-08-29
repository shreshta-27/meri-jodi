import express from "express"
import notificationController from "../controllers/notification.controller.js"
import { attachUser } from "../middlewares/auth.js"
import { validate } from "../middlewares/validate.js"
import { validateObjectId } from "../validators/shared.validator.js"

const router = express.Router()

router.use(attachUser)

router.get("/unread-count", notificationController.getUnreadCount.bind(notificationController))
router.get("/", notificationController.getNotifications.bind(notificationController))
router.put("/read-all", notificationController.markAllAsRead.bind(notificationController))
router.put("/:id/read", validateObjectId("id"), validate, notificationController.markAsRead.bind(notificationController))

export default router
