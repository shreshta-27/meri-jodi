import { body } from "express-validator"
import mongoose from "mongoose"

export const toggleShortlist = [
    body().custom((value, { req }) => {
        const id = req.body?.profileId || req.body?.targetProfileId || req.body?.shortlistedProfileId
        if (!id) {
            throw new Error("Profile ID is required")
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid profile ID")
        }
        return true
    }),
]

