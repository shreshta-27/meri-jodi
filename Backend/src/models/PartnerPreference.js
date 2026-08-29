import mongoose from "mongoose"
import { GENDER, HOBBIES_LIST, MARITAL_STATUS } from "../constants/index.js"
const { Schema, model } = mongoose

const partnerPreferenceSchema = new Schema(
    {
        profileId: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
            unique: true,
        },
        gender: {
            type: String,
            enum: Object.values(GENDER),
            required: true,
        },
        ageMin: { type: Number, min: 18, max: 80 },
        ageMax: { type: Number, min: 18, max: 80 },
        religion: String,
        caste: String,
        location: String,
        education: String,
        occupation: String,
        annualIncome: String,
        hobbiesAndInterests: {
            type: [String],
            enum: HOBBIES_LIST,
            default: [],
        },
        heightMinCm: Number,
        heightMaxCm: Number,
        maritalStatus: {
            type: [String],
            enum: Object.values(MARITAL_STATUS),
        },
        willingToRelocate: Boolean,
    },
    { timestamps: true }
)

export const PartnerPreference = model(
    "PartnerPreference",
    partnerPreferenceSchema
)
