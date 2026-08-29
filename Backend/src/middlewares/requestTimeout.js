/**
 * Middleware to enforce request timeouts.
 * Sends 504 Gateway Timeout if the request takes longer than the specified duration.
 * @param {number} ms - Timeout in milliseconds (default: 30s)
 */
const requestTimeout = (ms = 30000) => {
    return (req, res, next) => {
        const timer = setTimeout(() => {
            if (!res.headersSent) {
                res.status(504).json({
                    success: false,
                    message: "Request timed out",
                })
            }
        }, ms)

        // Clear timeout when response finishes
        res.on("finish", () => clearTimeout(timer))
        res.on("close", () => clearTimeout(timer))

        next()
    }
}

export default requestTimeout
