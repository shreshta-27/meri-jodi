import axiosInstance from "./axiosInstance"

const VERIFICATION_BASE = "/verifications"

const unwrap = (response) => response.data?.data ?? response.data

export const getMyVerification = async () => {
    try {
        const response = await axiosInstance.get(`${VERIFICATION_BASE}/me`)
        return unwrap(response)
    } catch {
        return null
    }
}

export const submitVerification = async (documentType, documentUrl) => {
    const response = await axiosInstance.post(VERIFICATION_BASE, {
        documentType,
        documentUrl,
    })
    return unwrap(response)
}
