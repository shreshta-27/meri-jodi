import { body } from "express-validator"

export const sendInterest = [
    body("receiverProfileId")
        .notEmpty()
        .withMessage("Receiver profile ID is required")
        .isMongoId()
        .withMessage("Invalid receiver profile ID"),
]
