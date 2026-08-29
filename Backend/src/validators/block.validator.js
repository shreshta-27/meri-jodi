import { body } from "express-validator"

export const blockUser = [
    body().custom((value, { req }) => {
        const id = req.body.profileId || req.body.blockedProfileId
        if (!id) throw new Error("Profile ID is required")
        if (!/^[0-9a-fA-F]{24}$/.test(id)) throw new Error("Invalid profile ID")
        return true
    }),
]
