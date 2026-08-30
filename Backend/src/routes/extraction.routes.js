import express from "express"
import multer from "multer"
import extractionController from "../controllers/extraction.controller.js"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post("/extract-biodata", upload.single("file"), extractionController.extractBiodata)

export default router
