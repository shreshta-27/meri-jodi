import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary-v2"
import cloudinary from "../config/cloudinary.js"

const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp", "gif"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "merijodi/profile-photos",
        allowed_formats: ALLOWED_FORMATS,
        transformation: [
            { width: 800, height: 800, crop: "limit", quality: "auto" },
        ],
        public_id: (req, file) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
            return `profile-${uniqueSuffix}`
        },
    },
})

const fileFilter = (req, file, cb) => {
    const ext = file.originalname.split(".").pop().toLowerCase()
    if (ALLOWED_FORMATS.includes(ext)) {
        cb(null, true)
    } else {
        cb(new Error(`Only ${ALLOWED_FORMATS.join(", ")} formats are allowed`), false)
    }
}

export const uploadPhoto = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
    },
})

export const uploadMultiplePhotos = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 6,
    },
})

export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File size must be less than 5MB",
            })
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Too many files. Maximum 6 photos allowed",
            })
        }
        return res.status(400).json({
            success: false,
            message: err.message,
        })
    }
    // Handle file filter errors (plain Error from cb(err))
    if (err && err.message && err.message.includes("formats are allowed")) {
        return res.status(400).json({
            success: false,
            message: err.message,
        })
    }
    next(err)
}
