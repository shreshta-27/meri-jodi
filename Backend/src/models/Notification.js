import mongoose from "mongoose"
import { NOTIFICATION_TYPE } from "../constants/index.js"
const { Schema, model } = mongoose

const notificationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(NOTIFICATION_TYPE),
            required: true,
        },
        message: String,
        isRead: { type: Boolean, default: false },
        readAt: Date,
        relatedProfileId: { type: Schema.Types.ObjectId, ref: "Profile" },
    },
    { timestamps: true }
)

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 })

export const Notification = model("Notification", notificationSchema)
