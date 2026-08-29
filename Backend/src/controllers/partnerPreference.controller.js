import BaseController from "./base.controller.js"
import partnerPreferenceService from "../services/partnerPreference.service.js"
import profileService from "../services/profile.service.js"

class PartnerPreferenceController extends BaseController {
    async getMyPreferences(req, res, next) {
        try {
            const profile = await profileService.getByUserId(req.user._id)
            if (!profile) {
                return this.sendError(res, "Profile not found", 404)
            }

            const preferences = await partnerPreferenceService.getByProfileId(
                profile._id
            )
            return this.sendSuccess(
                res,
                preferences,
                "Preferences retrieved"
            )
        } catch (error) {
            next(error)
        }
    }

    async updatePreferences(req, res, next) {
        try {
            const profile = await profileService.getByUserId(req.user._id)
            if (!profile) {
                return this.sendError(res, "Profile not found", 404)
            }

            const preferences = await partnerPreferenceService.createOrUpdate(
                profile._id,
                req.body
            )
            return this.sendSuccess(
                res,
                preferences,
                "Preferences updated"
            )
        } catch (error) {
            next(error)
        }
    }
}

export default new PartnerPreferenceController()
