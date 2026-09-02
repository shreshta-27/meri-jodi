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
        .optional({ values: "falsy" })
        .isFloat({ min: 100, max: 250 })
        .withMessage("Height must be between 100 and 250 cm"),
    body("religion")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("caste")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("maritalStatus")
        .optional({ values: "falsy" })
        .isIn(maritalStatusValues),
    body("aboutMe")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage("About me must not exceed 2000 characters"),
    body("motherTongue")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("location.city")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("location.state")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("location.country")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("location.pincode")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 3, max: 10 }),
    body("location.willingToRelocate")
        .optional({ values: "falsy" })
        .isBoolean(),
    body("education.highestDegree")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("education.fieldOfStudy")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("education.institution")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 200 }),
    body("education.graduationYear")
        .optional({ values: "falsy" })
        .isInt({ min: 1950, max: 2030 }),
    body("career.occupation")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("career.companyName")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 200 }),
    body("career.industry")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("career.annualIncome")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("career.workLocation")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("family.fatherOccupation")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("family.motherOccupation")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("family.numBrothers")
        .optional({ values: "falsy" })
        .isInt({ min: 0, max: 20 }),
    body("family.numSisters")
        .optional({ values: "falsy" })
        .isInt({ min: 0, max: 20 }),
    body("family.familyType")
        .optional({ values: "falsy" })
        .isIn(familyTypeValues),
    body("family.familyValues")
        .optional({ values: "falsy" })
        .isIn(familyValuesValues),
    body("family.familyAffluence")
        .optional({ values: "falsy" })
        .isIn(familyAffluenceValues),
    body("lifestyle.diet")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("lifestyle.smoking")
        .optional({ values: "falsy" })
        .isBoolean(),
    body("lifestyle.drinking")
        .optional({ values: "falsy" })
        .isBoolean(),
    body("hobbiesAndInterests")
        .optional({ values: "falsy" })
        .isArray(),
    body("manglik")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("complexion")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("createdBy")
        .optional({ values: "falsy" })
        .isIn(createdByValues),
]

export const updateProfile = [
    body("dateOfBirth")
        .optional({ values: "falsy" })
        .isISO8601()
        .withMessage("Invalid date format"),
    body("gender")
        .optional({ values: "falsy" })
        .isIn(genderValues),
    body("heightCm")
        .optional({ values: "falsy" })
        .isFloat({ min: 100, max: 250 }),
    body("religion")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("caste")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("maritalStatus")
        .optional({ values: "falsy" })
        .isIn(maritalStatusValues),
    body("aboutMe")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 2000 }),
    body("motherTongue")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("location.city")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("location.state")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("location.country")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("location.pincode")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 3, max: 10 }),
    body("location.willingToRelocate")
        .optional({ values: "falsy" })
        .isBoolean(),
    body("education.highestDegree")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("education.fieldOfStudy")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("education.institution")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 200 }),
    body("education.graduationYear")
        .optional({ values: "falsy" })
        .isInt({ min: 1950, max: 2030 }),
    body("career.occupation")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("career.companyName")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 200 }),
    body("career.industry")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("career.annualIncome")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("career.workLocation")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("family.fatherOccupation")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("family.motherOccupation")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("family.numBrothers")
        .optional({ values: "falsy" })
        .isInt({ min: 0, max: 20 }),
    body("family.numSisters")
        .optional({ values: "falsy" })
        .isInt({ min: 0, max: 20 }),
    body("family.familyType")
        .optional({ values: "falsy" })
        .isIn(familyTypeValues),
    body("family.familyValues")
        .optional({ values: "falsy" })
        .isIn(familyValuesValues),
    body("family.familyAffluence")
        .optional({ values: "falsy" })
        .isIn(familyAffluenceValues),
    body("gotham")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("rashi")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("nakshtra")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("lifestyle.diet")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 100 }),
    body("lifestyle.smoking")
        .optional({ values: "falsy" })
        .isBoolean(),
    body("lifestyle.drinking")
        .optional({ values: "falsy" })
        .isBoolean(),
    body("hobbiesAndInterests")
        .optional({ values: "falsy" })
        .isArray(),
    body("manglik")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("complexion")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("createdBy")
        .optional({ values: "falsy" })
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
