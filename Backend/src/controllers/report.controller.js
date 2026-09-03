import BaseController from "./base.controller.js"
import reportService from "../services/report.service.js"
import profileService from "../services/profile.service.js"

class ReportController extends BaseController {
    async createReport(req, res, next) {
        try {
            const profile = await profileService.getByUserId(req.user._id)
            if (!profile) {
                return this.sendError(res, "Profile not found", 404)
            }

            const report = await reportService.create(
                profile._id.toString(),
                req.body.reportedProfileId,
                req.body.reason,
                req.body.description
            )

            return this.sendSuccess(res, report, "Report submitted", 201)
        } catch (error) {
            if (error.message === "Cannot report yourself") {
                return this.sendError(res, error.message, 400)
            }
            next(error)
        }
    }

    async getReports(req, res, next) {
        try {
            const result = await reportService.getAll({
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
                status: req.query.status,
            })
            return this.sendSuccess(res, result, "Reports retrieved")
        } catch (error) {
            next(error)
        }
    }

    async updateReportStatus(req, res, next) {
        try {
            const actionTaken = req.body.actionTaken || req.body.resolutionNotes || ""
            const report = await reportService.updateStatus(
                req.params.id,
                req.body.status,
                actionTaken,
                req.user?._id
            )
            if (!report) {
                return this.sendError(res, "Report not found", 404)
            }
            return this.sendSuccess(res, report, "Report status updated")
        } catch (error) {
            next(error)
        }
    }
}

export default new ReportController()
