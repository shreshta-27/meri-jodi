import axiosInstance from "./axiosInstance"

const PHOTO_BASE = "/photos"

const unwrap = (response) => response.data?.data ?? response.data

/**
 * Upload a photo to Cloudinary and attach to user profile
 * @param {File} file - Photo file to upload
 * @param {object} options - { isPrimary, isVisibleToAll }
 */
export const uploadPhoto = async (file, options = {}) => {
    const formData = new FormData()
    formData.append("photo", file)
    if (options.isPrimary) formData.append("isPrimary", "true")
    if (options.isVisibleToAll !== undefined) {
        formData.append("isVisibleToAll", String(options.isVisibleToAll))
    }

    const response = await axiosInstance.post(PHOTO_BASE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    })
    return unwrap(response)
}

/**
 * Delete a photo from user profile and Cloudinary
 * @param {string} photoId
 */
export const deletePhoto = async (photoId) => {
    const response = await axiosInstance.delete(`${PHOTO_BASE}/${photoId}`)
    return unwrap(response)
}

/**
 * Set a photo as the primary profile photo
 * @param {string} photoId
 */
export const setPrimaryPhoto = async (photoId) => {
    const response = await axiosInstance.put(`${PHOTO_BASE}/primary/${photoId}`)
    return unwrap(response)
}
