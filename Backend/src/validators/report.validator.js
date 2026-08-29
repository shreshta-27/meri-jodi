import { body } from "express-validator"
import { REPORT_REASON, REPORT_STATUS } from "../constants/index.js"

const reportReasonValues = Object.values(REPORT_REASON)
const reportStatusValues = Object.values(REPORT_STATUS).filter(s => s !== "pending")

export const createReport = [
    body("reportedProfileId")
        .notEmpty()
        .withMessage("Reported profile ID is required")
        .isMongoId()
        .withMessage("Invalid reported profile ID"),
    body("reason")
        .notEmpty()
        .withMessage("Report reason is required")
        .isIn(reportReasonValues)
        .withMessage(`Invalid report reason. Must be one of: ${reportReasonValues.join(", ")}`),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 1000 }),
]

export const updateReportStatus = [
    body("status")
        .notEmpty()
        .withMessage("Status is required")
        .isIn(reportStatusValues)
        .withMessage(`Invalid status. Must be one of: ${reportStatusValues.join(", ")}`),
]
