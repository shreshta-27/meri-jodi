import BaseController from "./base.controller.js"
import shortlistService from "../services/shortlist.service.js"
import profileService from "../services/profile.service.js"

class ShortlistController extends BaseController {
    async toggleShortlist(req, res, next) {
        try {
            const profile = await profileService.getByUserId(req.user._id)
            if (!profile) {
                return this.sendError(res, "Profile not found", 404)
            }

            const result = await shortlistService.toggle(
                profile._id.toString(),
                req.body.profileId
            )

            return this.sendSuccess(
                res,
                result,
                result.action === "added"
                    ? "Profile shortlisted"
                    : "Profile removed from shortlist"
            )
        } catch (error) {
            if (error.message === "Cannot shortlist yourself") {
                return this.sendError(res, error.message, 400)
            }
            next(error)
        }
    }

    async getShortlisted(req, res, next) {
        try {
            const profile = await profileService.getByUserId(req.user._id)
            if (!profile) {
                return this.sendError(res, "Profile not found", 404)
            }

            const shortlisted = await shortlistService.getShortlisted(
                profile._id.toString()
            )
            return this.sendSuccess(
                res,
                shortlisted,
                "Shortlisted profiles retrieved"
            )
        } catch (error) {
            next(error)
        }
    }
}

export default new ShortlistController()
