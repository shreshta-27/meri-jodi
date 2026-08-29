import axiosInstance from "./axiosInstance"

const SHORTLIST_BASE = "/shortlist"

const unwrap = (response) => response.data?.data ?? response.data

/**
 * Toggle shortlist on a profile
 * @param {string} profileId - Target profile ID to shortlist/un-shortlist
 */
export const toggleShortlist = async (profileId) => {
    const response = await axiosInstance.post(SHORTLIST_BASE, { profileId })
    return unwrap(response)
}

/**
 * Get all shortlisted profiles for the logged-in user
 */
export const getShortlistedProfiles = async () => {
    try {
        const response = await axiosInstance.get(SHORTLIST_BASE)
        return unwrap(response) || []
    } catch (err) {
        console.error("Failed to fetch shortlisted profiles:", err)
        return []
    }
}
