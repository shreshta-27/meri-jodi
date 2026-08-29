import { Report } from "../models/Report.js"
import { PAGINATION_DEFAULTS } from "../constants/index.js"

class ReportService {
    /**
     * Create a report
     * @param {string} reporterProfileId
     * @param {string} reportedProfileId
     * @param {string} reason
     * @param {string} description
     * @returns {Promise<object>}
     */
    async create(reporterProfileId, reportedProfileId, reason, description) {
        if (reporterProfileId === reportedProfileId) {
            throw new Error("Cannot report yourself")
        }

        return Report.create({
            reporterProfileId,
            reportedProfileId,
            reason,
            description,
        })
    }

    /**
     * Get all reports (admin)
     * @param {object} options - Pagination and filters
     * @returns {Promise<object>}
     */
    async getAll(options = {}) {
        const page = options.page || PAGINATION_DEFAULTS.PAGE
        const limit = Math.min(
            options.limit || PAGINATION_DEFAULTS.LIMIT,
            PAGINATION_DEFAULTS.MAX_LIMIT
        )
        const skip = (page - 1) * limit

        const query = {}
        if (options.status) query.status = options.status

        const [reports, total] = await Promise.all([
            Report.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("reporterProfileId", "gender location")
                .populate("reportedProfileId", "gender location"),
            Report.countDocuments(query),
        ])

        return {
            reports,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    /**
     * Update report status (admin)
     * @param {string} reportId
     * @param {string} status
     * @returns {Promise<object|null>}
     */
    async updateStatus(reportId, status) {
        return Report.findByIdAndUpdate(
            reportId,
            { status, reviewedAt: new Date() },
            { returnDocument: "after" }
        )
    }
}

export default new ReportService()
