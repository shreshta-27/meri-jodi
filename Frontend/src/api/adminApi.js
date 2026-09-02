import axiosInstance from "./axiosInstance"

export const getAdminVerifications = async (params = {}) => {
    const res = await axiosInstance.get("/verifications", { params })
    return res.data?.data || res.data
}

export const reviewAdminVerification = async (id, status, reviewNote = "") => {
    const res = await axiosInstance.put(`/verifications/${id}/review`, { status, reviewNote })
    return res.data?.data || res.data
}

export const getAdminReports = async (params = {}) => {
    const res = await axiosInstance.get("/reports", { params })
    return res.data?.data || res.data
}

export const updateAdminReportStatus = async (id, status, resolutionNotes = "") => {
    const res = await axiosInstance.put(`/reports/${id}/status`, { status, resolutionNotes })
    return res.data?.data || res.data
}
