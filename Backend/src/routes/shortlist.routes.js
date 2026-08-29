import express from "express"
import shortlistController from "../controllers/shortlist.controller.js"
import { attachUser } from "../middlewares/auth.js"
import { validate } from "../middlewares/validate.js"
import { toggleShortlist } from "../validators/shortlist.validator.js"

const router = express.Router()

router.use(attachUser)

router.get("/", shortlistController.getShortlisted.bind(shortlistController))
router.post("/", toggleShortlist, validate, shortlistController.toggleShortlist.bind(shortlistController))

export default router
