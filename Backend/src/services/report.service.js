import { Report } from "../models/Report.js"
import { Profile } from "../models/Profile.js"
import { Notification } from "../models/Notification.js"
import { PAGINATION_DEFAULTS, NOTIFICATION_TYPE } from "../constants/index.js"

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
                .populate({
                    path: "reporterProfileId",
                    select: "name photos gender location userId",
                    populate: { path: "userId", select: "name avatar" },
                })
                .populate({
                    path: "reportedProfileId",
                    select: "name photos gender location userId",
                    populate: { path: "userId", select: "name avatar" },
                }),
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
     * @param {string} actionTaken
     * @param {string} resolvedByUserId
     * @returns {Promise<object|null>}
     */
    async updateStatus(reportId, status, actionTaken = "", resolvedByUserId = null) {
        const update = { status, reviewedAt: new Date() }
        if (actionTaken) update.actionTaken = actionTaken
        if (resolvedByUserId) update.resolvedBy = resolvedByUserId

        const report = await Report.findByIdAndUpdate(
            reportId,
            update,
            { returnDocument: "after" }
        ).populate("reporterProfileId", "userId")

        if (report && status === "resolved" && report.reporterProfileId?.userId) {
            await Notification.create({
                userId: report.reporterProfileId.userId,
                type: NOTIFICATION_TYPE.SYSTEM,
                message: `Your safety report has been reviewed and resolved by our moderation team. Thank you for keeping MeriJodi safe.`,
            }).catch(() => {})
        }

        return report
    }
}

export default new ReportService()

