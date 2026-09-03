import axiosInstance from "./axiosInstance"

export const getAdminStats = async () => {
    const res = await axiosInstance.get("/admin/stats")
    return res.data?.data || res.data
}

export const getAdminUsers = async (params = {}) => {
    const res = await axiosInstance.get("/admin/users", { params })
    return res.data?.data || res.data
}

export const getAdminUserById = async (id) => {
    const res = await axiosInstance.get(`/admin/users/${id}`)
    return res.data?.data || res.data
}

export const updateAdminUserStatus = async (id, status) => {
    const res = await axiosInstance.put(`/admin/users/${id}/status`, { status })
    return res.data?.data || res.data
}

export const updateAdminUserRole = async (id, role) => {
    const res = await axiosInstance.put(`/admin/users/${id}/role`, { role })
    return res.data?.data || res.data
}

export const toggleAdminUserVerification = async (id, isVerified) => {
    const res = await axiosInstance.put(`/admin/users/${id}/verify`, { isVerified })
    return res.data?.data || res.data
}

export const deleteAdminUser = async (id) => {
    const res = await axiosInstance.delete(`/admin/users/${id}`)
    return res.data?.data || res.data
}

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
    const res = await axiosInstance.put(`/reports/${id}/status`, { status, resolutionNotes, actionTaken: resolutionNotes })
    return res.data?.data || res.data
}
