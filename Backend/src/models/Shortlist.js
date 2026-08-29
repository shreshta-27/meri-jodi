import mongoose from "mongoose"
const { Schema, model } = mongoose

const shortlistSchema = new Schema(
    {
        profileId: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },
        shortlistedProfileId: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },
    },
    { timestamps: true }
)

shortlistSchema.index(
    { profileId: 1, shortlistedProfileId: 1 },
    { unique: true }
)

export const Shortlist = model("Shortlist", shortlistSchema)
