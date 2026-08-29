import express from "express"
import partnerPreferenceController from "../controllers/partnerPreference.controller.js"
import { attachUser } from "../middlewares/auth.js"
import { validate } from "../middlewares/validate.js"
import { createOrUpdatePreferences } from "../validators/partnerPreference.validator.js"

const router = express.Router()

router.use(attachUser)

router.get("/", partnerPreferenceController.getMyPreferences.bind(partnerPreferenceController))
router.put("/", createOrUpdatePreferences, validate, partnerPreferenceController.updatePreferences.bind(partnerPreferenceController))

export default router
