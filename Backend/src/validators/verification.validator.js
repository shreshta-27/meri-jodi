import { body } from "express-validator"
import { VERIFICATION_DOC_TYPE, VERIFICATION_STATUS } from "../constants/index.js"

const docTypeValues = Object.values(VERIFICATION_DOC_TYPE)
const reviewStatusValues = [VERIFICATION_STATUS.VERIFIED, VERIFICATION_STATUS.APPROVED, VERIFICATION_STATUS.REJECTED]

export const submitDocument = [
    body("documentType")
        .notEmpty()
        .withMessage("Document type is required")
        .isIn(docTypeValues)
        .withMessage(`Invalid document type. Must be one of: ${docTypeValues.join(", ")}`),
    body("documentUrl")
        .notEmpty()
        .withMessage("Document URL or ID number is required")
        .trim()
        .isLength({ min: 3, max: 500 })
        .withMessage("Document identifier must be between 3 and 500 characters"),
]

export const reviewVerification = [
    body("status")
        .notEmpty()
        .withMessage("Status is required")
        .isIn(reviewStatusValues)
        .withMessage(`Status must be one of: ${reviewStatusValues.join(", ")}`),
    body("reviewNote")
        .optional()
        .trim()
        .isLength({ max: 500 }),
]
