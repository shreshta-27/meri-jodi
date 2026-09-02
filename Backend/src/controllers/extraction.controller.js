import extractionService from "../services/extraction.service.js"
import ApiResponse from "../utils/ApiResponse.js"

class ExtractionController {
    async extractBiodata(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            if (!req.file) {
                return apiResponse.error("No file uploaded.", 400)
            }

            const data = await extractionService.extractBiodata(req.file.buffer, req.file.mimetype)
            return apiResponse.success(data, "Biodata extracted successfully")
        } catch (error) {
            console.error("Extraction error:", error)
            return apiResponse.error(error.message, error.statusCode || 500)
        }
    }

    async generateBio(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const bio = await extractionService.generateBio(req.body)
            return apiResponse.success({ bio }, "Bio generated successfully")
        } catch (error) {
            console.error("Bio generation error:", error)
            return apiResponse.error(error.message, error.statusCode || 500)
        }
    }
}

export default new ExtractionController()
