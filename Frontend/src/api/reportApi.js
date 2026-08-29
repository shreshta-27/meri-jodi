import axiosInstance from "./axiosInstance"

const REPORT_BASE = "/reports"

const unwrap = (response) => response.data?.data ?? response.data

/**
 * Report a profile
 * @param {string} reportedProfileId
 * @param {string} reason - One of "fake_profile", "inappropriate_messages", "harassment", "scam", "other"
 * @param {string} description - Optional text explanation
 */
export const reportProfile = async (reportedProfileId, reason, description = "") => {
    const response = await axiosInstance.post(REPORT_BASE, {
        reportedProfileId,
        reason,
        description,
    })
    return unwrap(response)
}
