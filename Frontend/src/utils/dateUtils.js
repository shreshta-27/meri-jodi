/**
 * Calculate age in years from date of birth
 * @param {string|Date} dateOfBirth
 * @returns {number|null}
 */
export const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    const dob = new Date(dateOfBirth)
    if (Number.isNaN(dob.getTime())) return null
    return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

/**
 * Format date of birth to DD/MM/YYYY
 * @param {string|Date} dateOfBirth
 * @returns {string|null}
 */
export const formatDate = (dateOfBirth) => {
    if (!dateOfBirth) return null
    const dob = new Date(dateOfBirth)
    if (Number.isNaN(dob.getTime())) return null
    return dob.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })
}

/**
 * Format height in cm to feet and inches (e.g. 5ft 9in (175cm))
 * @param {number} heightCm
 * @returns {string|null}
 */
export const formatHeight = (heightCm) => {
    if (!heightCm) return null
    const totalInches = heightCm / 2.54
    const feet = Math.floor(totalInches / 12)
    const inches = Math.round(totalInches % 12)
    return `${feet}ft ${inches}in (${heightCm}cm)`
}

/**
 * Human-readable time ago
 * @param {string|Date} date
 * @returns {string}
 */
export const timeAgo = (date) => {
    if (!date) return ""
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return ""
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000)

    if (diffSec < 60) return "just now"
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
}
