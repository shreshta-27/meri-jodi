import axiosInstance from "./axiosInstance"

const PREFERENCE_BASE = "/preferences"

const unwrap = (response) => response.data?.data ?? response.data

export const getPartnerPreferences = async () => {
    try {
        const response = await axiosInstance.get(PREFERENCE_BASE)
        return unwrap(response)
    } catch (err) {
        if (err.response?.status === 404) return null
        throw err
    }
}

export const updatePartnerPreferences = async (data) => {
    const response = await axiosInstance.put(PREFERENCE_BASE, data)
    return unwrap(response)
}

export const deletePartnerPreferences = async () => {
    const response = await axiosInstance.delete(PREFERENCE_BASE)
    return unwrap(response)
}
