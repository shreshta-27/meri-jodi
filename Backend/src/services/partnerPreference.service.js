import { PartnerPreference } from "../models/PartnerPreference.js"
import { Profile } from "../models/Profile.js"

const PREFERENCE_UPDATE_FIELDS = [
    "gender",
    "ageMin",
    "ageMax",
    "religion",
    "caste",
    "location",
    "education",
    "occupation",
    "annualIncome",
    "diet",
    "hobbiesAndInterests",
    "heightMinCm",
    "heightMaxCm",
    "maritalStatus",
    "willingToRelocate",
]

class PartnerPreferenceService {
    /**
     * Create or update partner preferences (whitelisted fields only)
     * @param {string} profileId - Profile ID
     * @param {object} data - Preference data
     * @returns {Promise<object>} Saved preferences
     */
    async createOrUpdate(profileId, data) {
        const sanitized = {}
        for (const field of PREFERENCE_UPDATE_FIELDS) {
            if (data[field] !== undefined) {
                sanitized[field] = data[field]
            }
        }

        // Normalize maritalStatus
        if (sanitized.maritalStatus) {
            if (typeof sanitized.maritalStatus === "string") {
                sanitized.maritalStatus = [sanitized.maritalStatus]
            }
            if (Array.isArray(sanitized.maritalStatus)) {
                sanitized.maritalStatus = sanitized.maritalStatus.map((s) =>
                    s === "never" ? "never_married" : s
                )
            }
        }

        // Normalize willingToRelocate
        if (sanitized.willingToRelocate !== undefined) {
            sanitized.willingToRelocate = sanitized.willingToRelocate === true || sanitized.willingToRelocate === "true"
        }

        // Ensure gender is present for upserts (required field not enforced by $set)
        if (!sanitized.gender) {
            const existing = await PartnerPreference.findOne({ profileId })
            if (existing && existing.gender) {
                sanitized.gender = existing.gender
            } else {
                const profile = await Profile.findById(profileId)
                if (profile && profile.gender) {
                    sanitized.gender = profile.gender.toLowerCase() === "male" ? "female" : "male"
                } else {
                    sanitized.gender = "female"
                }
            }
        }

        // Cross-validation: ageMin <= ageMax
        if (sanitized.ageMin !== undefined && sanitized.ageMax !== undefined) {
            if (Number(sanitized.ageMin) > Number(sanitized.ageMax)) {
                throw new Error("Minimum age must be less than or equal to maximum age")
            }
        }

        // Cross-validation: heightMinCm <= heightMaxCm
        if (sanitized.heightMinCm !== undefined && sanitized.heightMaxCm !== undefined) {
            if (Number(sanitized.heightMinCm) > Number(sanitized.heightMaxCm)) {
                throw new Error("Minimum height must be less than or equal to maximum height")
            }
        }

        const preferences = await PartnerPreference.findOneAndUpdate(
            { profileId },
            { $set: sanitized },
            { returnDocument: "after", runValidators: true, upsert: true }
        )
        return preferences
    }

    /**
     * Get preferences by profile ID
     * @param {string} profileId - Profile ID
     * @returns {Promise<object|null>} Preferences or null
     */
    async getByProfileId(profileId) {
        return PartnerPreference.findOne({ profileId })
    }

    /**
     * Delete preferences by profile ID
     * @param {string} profileId - Profile ID
     * @returns {Promise<object|null>} Deleted preferences
     */
    async delete(profileId) {
        return PartnerPreference.findOneAndDelete({ profileId })
    }
}

export default new PartnerPreferenceService()
