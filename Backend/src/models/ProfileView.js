import mongoose from "mongoose"
const { Schema, model } = mongoose

const profileViewSchema = new Schema(
    {
        viewerProfileId: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },
        viewedProfileId: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },
        lastViewedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
)

profileViewSchema.index(
    { viewerProfileId: 1, viewedProfileId: 1 },
    { unique: true }
)
profileViewSchema.index({ viewedProfileId: 1, lastViewedAt: -1 })

export const ProfileView = model("ProfileView", profileViewSchema)
