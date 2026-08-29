import { PartnerPreference } from "../models/PartnerPreference.js"

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

        // Ensure gender is present for upserts (required field not enforced by $set)
        if (!sanitized.gender) {
            // Check if existing preferences have gender
            const existing = await PartnerPreference.findOne({ profileId })
            if (!existing || !existing.gender) {
                throw new Error("Gender is required")
            }
        }

        // Cross-validation: ageMin <= ageMax
        if (sanitized.ageMin !== undefined && sanitized.ageMax !== undefined) {
            if (sanitized.ageMin > sanitized.ageMax) {
                throw new Error("Minimum age must be less than or equal to maximum age")
            }
        }

        // Cross-validation: heightMinCm <= heightMaxCm
        if (sanitized.heightMinCm !== undefined && sanitized.heightMaxCm !== undefined) {
            if (sanitized.heightMinCm > sanitized.heightMaxCm) {
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
