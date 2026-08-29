import { param } from "express-validator"

export const validateObjectId = (paramName = "id") =>
    param(paramName)
        .isMongoId()
        .withMessage(`Invalid ${paramName} format`)
