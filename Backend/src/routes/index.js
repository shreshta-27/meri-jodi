import express from "express"
import profileRoutes from "./profile.routes.js"
import partnerPreferenceRoutes from "./partnerPreference.routes.js"
import interestRoutes from "./interest.routes.js"
import messageRoutes from "./message.routes.js"
import shortlistRoutes from "./shortlist.routes.js"
import blockRoutes from "./block.routes.js"
import reportRoutes from "./report.routes.js"
import notificationRoutes from "./notification.routes.js"
import verificationRoutes from "./verification.routes.js"
import matchingRoutes from "./matching.routes.js"
import photoRoutes from "./photo.routes.js"
import extractionRoutes from "./extraction.routes.js"

const router = express.Router()

// Protected routes
router.use("/profiles", profileRoutes)
router.use("/preferences", partnerPreferenceRoutes)
router.use("/interests", interestRoutes)
router.use("/messages", messageRoutes)
router.use("/shortlists", shortlistRoutes)
router.use("/blocks", blockRoutes)
router.use("/reports", reportRoutes)
router.use("/notifications", notificationRoutes)
router.use("/verifications", verificationRoutes)
router.use("/matches", matchingRoutes)
router.use("/photos", photoRoutes)
router.use("/extraction", extractionRoutes)

export default router
