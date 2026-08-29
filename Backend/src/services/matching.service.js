import mongoose from "mongoose"
import { Profile } from "../models/Profile.js"
import { PartnerPreference } from "../models/PartnerPreference.js"
import { Block } from "../models/Block.js"
import { Interest } from "../models/Interest.js"
import { PAGINATION_DEFAULTS } from "../constants/index.js"

/**
 * Calculate age from date of birth
 * @param {Date} dateOfBirth
 * @returns {number|null}
 */
const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    return Math.floor(
        (Date.now() - new Date(dateOfBirth).getTime()) /
            (1000 * 60 * 60 * 24 * 365.25)
    )
}

class MatchingService {
    /**
     * Find matches for a profile based on partner preferences
     * @param {string} profileId
     * @param {object} options - Pagination
     * @returns {Promise<object>}
     */
    async findMatches(profileId, options = {}) {
        const page = options.page || PAGINATION_DEFAULTS.PAGE
        const limit = Math.min(
            options.limit || PAGINATION_DEFAULTS.LIMIT,
            PAGINATION_DEFAULTS.MAX_LIMIT
        )

        const profile = await Profile.findById(profileId)
        if (!profile) throw new Error("Profile not found")

        // Run independent queries in parallel
        const [preferences, blocked, interests] = await Promise.all([
            PartnerPreference.findOne({ profileId }),
            Block.find({
                $or: [
                    { blockerProfileId: profileId },
                    { blockedProfileId: profileId },
                ],
            }),
            Interest.find({
                $or: [
                    { senderProfileId: profileId },
                    { receiverProfileId: profileId },
                ],
            }).select("senderProfileId receiverProfileId -_id"),
        ])
        const blockedIds = blocked.map((b) =>
            b.blockerProfileId.toString() === profileId
                ? b.blockedProfileId
                : b.blockerProfileId
        )

        const interestedIds = interests.map((i) =>
            i.senderProfileId.toString() === profileId
                ? i.receiverProfileId
                : i.senderProfileId
        )

        // Build match query
        const query = {
            _id: { $ne: profileId, $nin: [...blockedIds, ...interestedIds] },
        }

        // Gender filter - prefer partner preference gender, fallback to opposite
        if (preferences?.gender) {
            query.gender = preferences.gender
        } else if (profile.gender === "male") {
            query.gender = "female"
        } else if (profile.gender === "female") {
            query.gender = "male"
        }
        // If gender is "other" and no preference, show all genders

        // Apply preference filters
        if (preferences) {
            if (preferences.religion) query.religion = preferences.religion
            if (preferences.caste) query.caste = preferences.caste
            if (preferences.maritalStatus && preferences.maritalStatus.length > 0) {
                query.maritalStatus = { $in: preferences.maritalStatus }
            }
            if (preferences.location) {
                query["location.city"] = preferences.location
            }

            // Age filter
            if (preferences.ageMin || preferences.ageMax) {
                const now = new Date()
                if (preferences.ageMax) {
                    query.dateOfBirth = {
                        $gte: new Date(
                            now.getFullYear() - preferences.ageMax,
                            now.getMonth(),
                            now.getDate()
                        ),
                    }
                }
                if (preferences.ageMin) {
                    query.dateOfBirth = {
                        ...query.dateOfBirth,
                        $lte: new Date(
                            now.getFullYear() - preferences.ageMin,
                            now.getMonth(),
                            now.getDate()
                        ),
                    }
                }
            }

            // Height filter
            if (preferences.heightMinCm) {
                query.heightCm = { ...query.heightCm, $gte: preferences.heightMinCm }
            }
            if (preferences.heightMaxCm) {
                query.heightCm = { ...query.heightCm, $lte: preferences.heightMaxCm }
            }
        }

        const skip = (page - 1) * limit

        // Fetch more candidates than needed to ensure correct sorting by compatibility.
        // DB filters narrow the pool, then we sort by compatibility in memory.
        const fetchLimit = Math.max(limit * 3, 60)

        const [allCandidates, total] = await Promise.all([
            Profile.find(query)
                .sort({ createdAt: -1 })
                .limit(fetchLimit)
                .lean(),
            Profile.countDocuments(query),
        ])

        // Calculate compatibility score for each candidate
        const candidatesWithScore = allCandidates.map((match) => ({
            ...match,
            age: calculateAge(match.dateOfBirth),
            compatibilityScore: this._calculateCompatibility(
                profile,
                { ...match, age: calculateAge(match.dateOfBirth) },
                preferences
            ),
        }))

        // Sort by compatibility score (descending)
        candidatesWithScore.sort((a, b) => b.compatibilityScore - a.compatibilityScore)

        // Paginate after sorting
        const matches = candidatesWithScore.slice(skip, skip + limit)

        return {
            matches,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    /**
     * Calculate compatibility score between two profiles
     * @param {object} userProfile - Current user's profile
     * @param {object} matchProfile - Potential match's profile
     * @param {object} preferences - User's partner preferences
     * @returns {number} Score from 0-100
     */
    _calculateCompatibility(userProfile, matchProfile, preferences) {
        let score = 0
        let maxScore = 0

        // Religion match (20 points)
        maxScore += 20
        if (preferences?.religion && matchProfile.religion) {
            if (userProfile.religion === matchProfile.religion) score += 20
        } else {
            score += 10
        }

        // Caste match (15 points)
        maxScore += 15
        if (preferences?.caste && matchProfile.caste) {
            if (userProfile.caste === matchProfile.caste) score += 15
        } else {
            score += 7.5
        }

        // Location match (15 points)
        maxScore += 15
        if (preferences?.location && matchProfile.location?.city) {
            if (preferences.location === matchProfile.location.city) {
                score += 15
            }
        } else {
            score += 7.5
        }

        // Age preference (15 points)
        maxScore += 15
        if (preferences?.ageMin || preferences?.ageMax) {
            const matchAge = matchProfile.age
            if (matchAge) {
                const min = preferences.ageMin || 18
                const max = preferences.ageMax || 80
                if (matchAge >= min && matchAge <= max) score += 15
            }
        } else {
            score += 7.5
        }

        // Education match (10 points)
        maxScore += 10
        if (preferences?.education && matchProfile.education?.highestDegree) {
            if (
                matchProfile.education.highestDegree
                    .toLowerCase()
                    .includes(preferences.education.toLowerCase())
            ) {
                score += 10
            }
        } else {
            score += 5
        }

        // Occupation match (10 points)
        maxScore += 10
        if (preferences?.occupation && matchProfile.career?.occupation) {
            if (
                matchProfile.career.occupation
                    .toLowerCase()
                    .includes(preferences.occupation.toLowerCase())
            ) {
                score += 10
            }
        } else {
            score += 5
        }

        // Profile completion bonus (15 points)
        maxScore += 15
        score += (matchProfile.profileCompletionPct / 100) * 15

        return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
    }
}

export default new MatchingService()
