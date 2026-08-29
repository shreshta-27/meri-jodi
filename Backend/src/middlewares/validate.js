import { validationResult } from "express-validator"

/**
 * Middleware that checks express-validator validation results.
 * Pass validation chains to this as middleware.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg,
                value: err.value,
            })),
        })
    }
    next()
}
