import ApiResponse from "../utils/ApiResponse.js"

const errorHandler = (err, req, res, next) => {
    const apiResponse = new ApiResponse(res)
    console.error(`[${new Date().toISOString()}] Error: ${err.message}`)
    if (process.env.NODE_ENV !== "production") {
        console.error(err.stack)
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message)
        return apiResponse.error(messages.join(", "), 400)
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]
        return apiResponse.error(
            `Duplicate value for ${field}`,
            409
        )
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === "CastError") {
        return apiResponse.error("Invalid ID format", 400)
    }

    // Multer errors
    if (err.name === "MulterError") {
        if (err.code === "LIMIT_FILE_SIZE") {
            return apiResponse.error(
                "File size must be less than 5MB",
                400
            )
        }
        return apiResponse.error(err.message, 400)
    }

    // Default error — sanitize in production
    const statusCode = err.statusCode || 500
    const message = process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : (err.message || "Internal Server Error")
    apiResponse.error(message, statusCode)
}

export default errorHandler
