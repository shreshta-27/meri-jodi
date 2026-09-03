import express from "express"
import adminController from "../controllers/admin.controller.js"
import verificationController from "../controllers/verification.controller.js"
import reportController from "../controllers/report.controller.js"
import { requireAdmin } from "../middlewares/auth.js"
import { validateObjectId } from "../validators/shared.validator.js"
import { validate } from "../middlewares/validate.js"

const router = express.Router()

// All admin routes enforce requireAdmin
router.use(requireAdmin)

// Statistics & KPIs
router.get("/stats", adminController.getStats.bind(adminController))

// Users Management
router.get("/users", adminController.getUsers.bind(adminController))
router.get("/users/:id", validateObjectId("id"), validate, adminController.getUserById.bind(adminController))
router.put("/users/:id/status", validateObjectId("id"), validate, adminController.updateUserStatus.bind(adminController))
router.put("/users/:id/role", validateObjectId("id"), validate, adminController.updateUserRole.bind(adminController))
router.put("/users/:id/verify", validateObjectId("id"), validate, adminController.toggleVerification.bind(adminController))
router.delete("/users/:id", validateObjectId("id"), validate, adminController.deleteUser.bind(adminController))

// Verifications Management (Aggregated for convenience)
router.get("/verifications", verificationController.getVerifications.bind(verificationController))
router.put("/verifications/:id/review", validateObjectId("id"), validate, verificationController.reviewVerification.bind(verificationController))

// Abuse Reports Management (Aggregated for convenience)
router.get("/reports", reportController.getReports.bind(reportController))
router.put("/reports/:id/status", validateObjectId("id"), validate, reportController.updateReportStatus.bind(reportController))

export default router
