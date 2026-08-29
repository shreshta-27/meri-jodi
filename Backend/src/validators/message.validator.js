import { body } from "express-validator"

export const sendMessage = [
    body("receiverProfileId")
        .notEmpty()
        .withMessage("Receiver profile ID is required")
        .isMongoId()
        .withMessage("Invalid receiver profile ID"),
    body("content")
        .notEmpty()
        .withMessage("Message content is required")
        .trim()
        .isLength({ min: 1, max: 5000 })
        .withMessage("Message must be between 1 and 5000 characters"),
]
