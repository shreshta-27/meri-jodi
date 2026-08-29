import express from "express"
import blockController from "../controllers/block.controller.js"
import { attachUser } from "../middlewares/auth.js"
import { validate } from "../middlewares/validate.js"
import { validateObjectId } from "../validators/shared.validator.js"
import { blockUser } from "../validators/block.validator.js"

const router = express.Router()

router.use(attachUser)

router.get("/", blockController.getBlocked.bind(blockController))
router.post("/", blockUser, validate, blockController.blockUser.bind(blockController))
router.delete("/:profileId", validateObjectId("profileId"), validate, blockController.unblockUser.bind(blockController))

export default router
