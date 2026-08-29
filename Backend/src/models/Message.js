import mongoose from "mongoose"
const { Schema, model } = mongoose

const messageSchema = new Schema(
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
        content: { type: String, required: true, trim: true },
        isRead: { type: Boolean, default: false },
        readAt: Date,
    },
    { timestamps: true }
)

messageSchema.index({ senderProfileId: 1, receiverProfileId: 1 })
messageSchema.index({ receiverProfileId: 1, isRead: 1 })

export const Message = model("Message", messageSchema)
