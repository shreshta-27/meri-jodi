import { body } from "express-validator"

export const toggleShortlist = [
    body("profileId")
        .notEmpty()
        .withMessage("Profile ID is required")
        .isMongoId()
        .withMessage("Invalid profile ID"),
]
