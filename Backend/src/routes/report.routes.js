import express from "express"
import reportController from "../controllers/report.controller.js"
import { attachUser, requireAdmin } from "../middlewares/auth.js"
import { validate } from "../middlewares/validate.js"
import { validateObjectId } from "../validators/shared.validator.js"
import { createReport, updateReportStatus } from "../validators/report.validator.js"

const router = express.Router()

router.use(attachUser)

router.post("/", ...createReport, validate, reportController.createReport.bind(reportController))
router.get("/", requireAdmin, reportController.getReports.bind(reportController))
router.put("/:id/status", requireAdmin, validateObjectId("id"), ...updateReportStatus, validate, reportController.updateReportStatus.bind(reportController))

export default router
