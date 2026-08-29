import mongoose from "mongoose"
import { VERIFICATION_DOC_TYPE, VERIFICATION_STATUS } from "../constants/index.js"
const { Schema, model } = mongoose

const verificationSchema = new Schema(
    {
        profileId: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
            index: true,
        },
        documentType: {
            type: String,
            enum: Object.values(VERIFICATION_DOC_TYPE),
            required: true,
        },
        documentUrl: { type: String, required: true },
        status: {
            type: String,
            enum: Object.values(VERIFICATION_STATUS),
            default: VERIFICATION_STATUS.SUBMITTED,
        },
        reviewNote: String,
        reviewedAt: Date,
    },
    { timestamps: true }
)

export const Verification = model("Verification", verificationSchema)
