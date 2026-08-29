import mongoose from "mongoose"
import { REPORT_REASON, REPORT_STATUS } from "../constants/index.js"
const { Schema, model } = mongoose

const reportSchema = new Schema(
    {
        reporterProfileId: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },
        reportedProfileId: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },
        reason: {
            type: String,
            enum: Object.values(REPORT_REASON),
            required: true,
        },
        description: String,
        status: {
            type: String,
            enum: Object.values(REPORT_STATUS),
            default: REPORT_STATUS.PENDING,
        },
        reviewedAt: Date,
    },
    { timestamps: true }
)

reportSchema.index({ status: 1, createdAt: -1 })

export const Report = model("Report", reportSchema)
