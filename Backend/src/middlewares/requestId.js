import crypto from "crypto"

/**
 * Middleware to assign a unique request ID to each incoming request.
 * Uses existing X-Request-ID header if present, otherwise generates one.
 * Attaches req.id for use in logging and error tracking.
 */
const requestId = (req, res, next) => {
    const existingId = req.headers["x-request-id"]
    req.id = existingId || crypto.randomUUID()

    // Set response header so clients can correlate responses
    res.setHeader("X-Request-ID", req.id)

    next()
}

export default requestId
