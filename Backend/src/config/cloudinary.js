import { v2 as cloudinary } from "cloudinary"
import { config } from "./config.js"

cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
})

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {object} options - Upload options
 * @returns {Promise<object>} Upload result
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
    const result = await cloudinary.uploader.upload(filePath, {
        folder: "merijodi/profile-photos",
        resource_type: "image",
        ...options,
    })
    return {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
    }
}

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {object} options - Upload options
 * @returns {Promise<object>} Upload result
 */
export const uploadStreamFromBuffer = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "merijodi/profile-photos",
                resource_type: "image",
                ...options,
            },
            (error, result) => {
                if (error) return reject(error)
                resolve({
                    publicId: result.public_id,
                    url: result.secure_url,
                    format: result.format,
                    width: result.width,
                    height: result.height,
                    bytes: result.bytes,
                })
            }
        )
        stream.end(buffer)
    })
}

/**
 * Delete an asset from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
    })
    return result
}

export default cloudinary
