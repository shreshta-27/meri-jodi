import mongoose from "mongoose"
import { INTEREST_STATUS } from "../constants/index.js"
const { Schema, model } = mongoose

const interestSchema = new Schema(
    {
        senderProfileId: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },
        receiverProfileId: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(INTEREST_STATUS),
            default: INTEREST_STATUS.PENDING,
        },
        respondedAt: Date,
    },
    { timestamps: true }
)

interestSchema.index(
    { senderProfileId: 1, receiverProfileId: 1 },
    { unique: true }
)
interestSchema.index({ senderProfileId: 1, createdAt: -1 })
interestSchema.index({ receiverProfileId: 1, createdAt: -1 })

export const Interest = model("Interest", interestSchema)
