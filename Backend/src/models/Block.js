import mongoose from "mongoose"
const { Schema, model } = mongoose

const blockSchema = new Schema(
    {
        blockerProfileId: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },
        blockedProfileId: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },
    },
    { timestamps: true }
)

blockSchema.index(
    { blockerProfileId: 1, blockedProfileId: 1 },
    { unique: true }
)
blockSchema.index(
    { blockedProfileId: 1, blockerProfileId: 1 }
)

export const Block = model("Block", blockSchema)
