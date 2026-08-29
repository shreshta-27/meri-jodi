import sanitize from "mongo-sanitize"

export const sanitizeBody = (req, res, next) => {
    if (req.body) {
        req.body = sanitize(req.body)
    }
    if (req.params) {
        req.params = sanitize(req.params)
    }
    if (req.query) {
        req.query = sanitize(req.query)
    }
    next()
}

export default sanitizeBody
