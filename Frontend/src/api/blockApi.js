import axiosInstance from "./axiosInstance"

const BLOCK_BASE = "/blocks"

const unwrap = (response) => response.data?.data ?? response.data

/**
 * Block a profile
 * @param {string} blockedProfileId
 */
export const blockProfile = async (blockedProfileId) => {
    const response = await axiosInstance.post(BLOCK_BASE, { blockedProfileId })
    return unwrap(response)
}

/**
 * Unblock a profile
 * @param {string} blockedProfileId
 */
export const unblockProfile = async (blockedProfileId) => {
    const response = await axiosInstance.delete(`${BLOCK_BASE}/${blockedProfileId}`)
    return unwrap(response)
}

/**
 * Get list of blocked profiles
 */
export const getBlockedProfiles = async () => {
    try {
        const response = await axiosInstance.get(BLOCK_BASE)
        return unwrap(response) || []
    } catch {
        return []
    }
}
