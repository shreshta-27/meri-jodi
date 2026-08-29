import { body, query } from "express-validator"
import { GENDER, MARITAL_STATUS, FAMILY_TYPE, FAMILY_VALUES, FAMILY_AFFLUENCE, PROFILE_CREATED_BY } from "../constants/index.js"

const genderValues = Object.values(GENDER)
const maritalStatusValues = Object.values(MARITAL_STATUS)
const familyTypeValues = Object.values(FAMILY_TYPE)
const familyValuesValues = Object.values(FAMILY_VALUES)
const familyAffluenceValues = Object.values(FAMILY_AFFLUENCE)
const createdByValues = Object.values(PROFILE_CREATED_BY)

export const createProfile = [
    body("dateOfBirth")
        .notEmpty()
        .withMessage("Date of birth is required")
        .isISO8601()
        .withMessage("Invalid date format"),
    body("gender")
        .notEmpty()
        .withMessage("Gender is required")
        .isIn(genderValues)
        .withMessage(`Gender must be one of: ${genderValues.join(", ")}`),
    body("heightCm")
        .optional()
        .isFloat({ min: 100, max: 250 })
        .withMessage("Height must be between 100 and 250 cm"),
    body("religion")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("caste")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("maritalStatus")
        .optional()
        .isIn(maritalStatusValues),
    body("aboutMe")
        .optional()
        .trim()
        .isLength({ min: 50, max: 1000 })
        .withMessage("About me must be between 50 and 1000 characters"),
    body("motherTongue")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("location.city")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("location.state")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("location.country")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("location.pincode")
        .optional()
        .trim()
        .isLength({ min: 3, max: 10 }),
    body("location.willingToRelocate")
        .optional()
        .isBoolean(),
    body("education.highestDegree")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("education.fieldOfStudy")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("education.institution")
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 }),
    body("education.graduationYear")
        .optional()
        .isInt({ min: 1950, max: 2030 }),
    body("career.occupation")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("career.companyName")
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 }),
    body("career.industry")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("career.annualIncome")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("career.workLocation")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("family.fatherOccupation")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("family.motherOccupation")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("family.numBrothers")
        .optional()
        .isInt({ min: 0, max: 20 }),
    body("family.numSisters")
        .optional()
        .isInt({ min: 0, max: 20 }),
    body("family.familyType")
        .optional()
        .isIn(familyTypeValues),
    body("family.familyValues")
        .optional()
        .isIn(familyValuesValues),
    body("family.familyAffluence")
        .optional()
        .isIn(familyAffluenceValues),
    body("createdBy")
        .optional()
        .isIn(createdByValues),
]

export const updateProfile = [
    body("dateOfBirth")
        .optional()
        .isISO8601()
        .withMessage("Invalid date format"),
    body("gender")
        .optional()
        .isIn(genderValues),
    body("heightCm")
        .optional()
        .isFloat({ min: 100, max: 250 }),
    body("religion")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("caste")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("maritalStatus")
        .optional()
        .isIn(maritalStatusValues),
    body("aboutMe")
        .optional()
        .trim()
        .isLength({ min: 50, max: 1000 }),
    body("motherTongue")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("location.city")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("location.state")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("location.country")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("location.pincode")
        .optional()
        .trim()
        .isLength({ min: 3, max: 10 }),
    body("location.willingToRelocate")
        .optional()
        .isBoolean(),
    body("education.highestDegree")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("education.fieldOfStudy")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("education.institution")
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 }),
    body("education.graduationYear")
        .optional()
        .isInt({ min: 1950, max: 2030 }),
    body("career.occupation")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("career.companyName")
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 }),
    body("career.industry")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("career.annualIncome")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("career.workLocation")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("family.fatherOccupation")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("family.motherOccupation")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("family.numBrothers")
        .optional()
        .isInt({ min: 0, max: 20 }),
    body("family.numSisters")
        .optional()
        .isInt({ min: 0, max: 20 }),
    body("family.familyType")
        .optional()
        .isIn(familyTypeValues),
    body("family.familyValues")
        .optional()
        .isIn(familyValuesValues),
    body("family.familyAffluence")
        .optional()
        .isIn(familyAffluenceValues),
    body("gotham")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("rashi")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("nakshtra")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("lifestyle.diet")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("lifestyle.smoking")
        .optional()
        .isBoolean(),
    body("lifestyle.drinking")
        .optional()
        .isBoolean(),
    body("createdBy")
        .optional()
        .isIn(createdByValues),
]

export const searchProfiles = [
    query("religion").optional().trim().isLength({ min: 1, max: 50 }),
    query("caste").optional().trim().isLength({ min: 1, max: 50 }),
    query("minAge")
        .optional()
        .isInt({ min: 18, max: 80 }),
    query("maxAge")
        .optional()
        .isInt({ min: 18, max: 80 }),
    query("gender")
        .optional()
        .isIn(genderValues),
    query("maritalStatus")
        .optional()
        .isIn(maritalStatusValues),
    query("city").optional().trim().isLength({ min: 1, max: 100 }),
    query("state").optional().trim().isLength({ min: 1, max: 100 }),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 }),
]
