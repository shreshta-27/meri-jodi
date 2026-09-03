import { body } from "express-validator"
import { GENDER, MARITAL_STATUS, HOBBIES_LIST } from "../constants/index.js"

const genderValues = Object.values(GENDER)
const maritalStatusValues = Object.values(MARITAL_STATUS)

export const createOrUpdatePreferences = [
    body("gender")
        .optional()
        .isIn(genderValues)
        .withMessage(`Gender must be one of: ${genderValues.join(", ")}`),
    body("ageMin")
        .optional()
        .isInt({ min: 18, max: 80 })
        .withMessage("Minimum age must be between 18 and 80"),
    body("ageMax")
        .optional()
        .isInt({ min: 18, max: 80 })
        .withMessage("Maximum age must be between 18 and 80"),
    body("religion")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("caste")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("location")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("education")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("occupation")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("annualIncome")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("diet")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("heightMinCm")
        .optional({ values: "falsy" })
        .isFloat({ min: 100, max: 250 }),
    body("heightMaxCm")
        .optional({ values: "falsy" })
        .isFloat({ min: 100, max: 250 }),
    body("maritalStatus")
        .optional({ values: "falsy" }),
    body("willingToRelocate")
        .optional({ values: "falsy" }),
    body("hobbiesAndInterests")
        .optional({ values: "falsy" }),
]
