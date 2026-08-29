import { body } from "express-validator"

export const blockUser = [
    body("profileId")
        .notEmpty()
        .withMessage("Profile ID is required")
        .isMongoId()
        .withMessage("Invalid profile ID"),
]
