import BaseController from "./base.controller.js"
import photoService from "../services/photo.service.js"

class PhotoController extends BaseController {
    async uploadPhoto(req, res, next) {
        try {
            if (!req.file) {
                return this.sendError(res, "No file uploaded", 400)
            }

            const profile = await photoService.upload(
                req.user._id,
                req.file,
                {
                    isPrimary: req.body.isPrimary === "true",
                    isVisibleToAll: req.body.isVisibleToAll !== "false",
                }
            )

            return this.sendSuccess(
                res,
                profile,
                "Photo uploaded successfully",
                201
            )
        } catch (error) {
            if (error.message === "Maximum 6 photos allowed") {
                return this.sendError(res, error.message, 400)
            }
            next(error)
        }
    }

    async deletePhoto(req, res, next) {
        try {
            const profile = await photoService.delete(
                req.user._id,
                req.params.photoId
            )
            return this.sendSuccess(res, profile, "Photo deleted")
        } catch (error) {
            if (error.message === "Photo not found") {
                return this.sendError(res, error.message, 404)
            }
            next(error)
        }
    }

    async setPrimaryPhoto(req, res, next) {
        try {
            const profile = await photoService.setPrimary(
                req.user._id,
                req.params.photoId
            )
            return this.sendSuccess(res, profile, "Primary photo updated")
        } catch (error) {
            if (error.message === "Photo not found") {
                return this.sendError(res, error.message, 404)
            }
            next(error)
        }
    }
}

export default new PhotoController()
