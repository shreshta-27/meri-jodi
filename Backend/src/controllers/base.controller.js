import ApiResponse from "../utils/ApiResponse.js"

/**
 * Base controller class with common utility methods
 * Provides a foundation for other controllers to extend
 */
class BaseController {
    /**
     * Send a success response
     * @param {Object} res - Express response object
     * @param {*} data - Data to send in the response
     * @param {string} message - Success message
     * @param {number} statusCode - HTTP status code
     * @returns {Object} Express response
     */
    sendSuccess(res, data, message = "Success", statusCode = 200) {
        const apiResponse = new ApiResponse(res)
        return apiResponse.success(data, message, statusCode)
    }

    /**
     * Send an error response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     * @returns {Object} Express response
     */
    sendError(res, message, statusCode = 400) {
        const apiResponse = new ApiResponse(res)
        return apiResponse.error(message, statusCode)
    }
}

export default BaseController
