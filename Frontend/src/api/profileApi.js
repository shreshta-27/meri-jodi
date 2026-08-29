import axiosInstance from "./axiosInstance"

const PROFILE_BASE = "/profiles"

const unwrap = (response) => response.data?.data ?? response.data

const MONTHS = {
  January: "01",
  February: "02",
  March: "03",
  April: "04",
  May: "05",
  June: "06",
  July: "07",
  August: "08",
  September: "09",
  October: "10",
  November: "11",
  December: "12",
}

const getDateOfBirth = (formData) => {
  const day = String(formData.day || "").padStart(2, "0")
  const monthRaw = formData.month || ""
  const month = MONTHS[monthRaw] || String(monthRaw).padStart(2, "0")
  const year = formData.year
  if (!day || !month || !year) return undefined
  return `${year}-${month}-${day}`
}

const parseHeightCm = (height) => {
  if (!height) return undefined
  const value = String(height).trim()
  const match = value.match(/^(\d+)'(\d+)"$/)
  if (match) {
    const feet = Number(match[1])
    const inches = Number(match[2])
    return Number.isFinite(feet) && Number.isFinite(inches)
      ? Math.round((feet * 12 + inches) * 2.54)
      : undefined
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : undefined
}

export const getMyProfile = async () => {
  try {
    const response = await axiosInstance.get(`${PROFILE_BASE}/me`)
    return unwrap(response)
  } catch (err) {
    if (err.response?.status === 404) return null
    throw err
  }
}

export const buildProfilePayload = (formData) => {
  const dateOfBirth = getDateOfBirth(formData)
  return {
    dateOfBirth,
    placeOfBirth: formData.birthPlace || undefined,
    gender: formData.gender ? String(formData.gender).toLowerCase() : undefined,
    motherTongue: formData.motherTongue || undefined,
    aboutMe: formData.about || undefined,
    heightCm: parseHeightCm(formData.height),
    location: {
      city: formData.location || undefined,
    },
    education: {
      highestDegree: formData.education || undefined,
    },
    career: {
      occupation: formData.occupation || undefined,
      companyName: formData.company || undefined,
      annualIncome: formData.income || undefined,
    },
    agreedToTerms: formData.acceptTerms || undefined,
  }
}

export const createProfile = async (formData) => {
  const response = await axiosInstance.post(PROFILE_BASE, formData)
  return unwrap(response)
}

export const updateProfile = async (partialData) => {
  const response = await axiosInstance.put(`${PROFILE_BASE}/me`, partialData)
  return unwrap(response)
}

export const buildPersonalDetailsPayload = (formData) => {
  const payload = {}
  if (formData.day || formData.month || formData.year) {
    payload.dateOfBirth = getDateOfBirth(formData)
  }
  if (formData.placeOfBirth !== undefined) payload.placeOfBirth = formData.placeOfBirth
  if (formData.gender !== undefined) payload.gender = String(formData.gender).toLowerCase()
  if (formData.heightCm !== undefined) payload.heightCm = parseHeightCm(formData.heightCm)
  if (formData.location !== undefined) payload.location = { city: formData.location }
  if (formData.maritalStatus !== undefined) payload.maritalStatus = formData.maritalStatus
  return payload
}

export const buildFamilyPayload = (formData) => {
  const payload = {}
  const family = {}
  if (formData.motherTongue !== undefined) payload.motherTongue = formData.motherTongue
  if (formData.familyType !== undefined) family.familyType = formData.familyType
  if (formData.fatherOccupation !== undefined) family.fatherOccupation = formData.fatherOccupation
  if (formData.motherOccupation !== undefined) family.motherOccupation = formData.motherOccupation
  if (formData.familyValues !== undefined) family.familyValues = formData.familyValues
  if (formData.numBrothers !== undefined) family.numBrothers = Number(formData.numBrothers) || 0
  if (formData.numSisters !== undefined) family.numSisters = Number(formData.numSisters) || 0
  if (Object.keys(family).length) payload.family = family
  return payload
}

export const buildCareerEducationPayload = (formData) => {
  const payload = {}
  const education = {}
  const career = {}
  if (formData.education !== undefined) education.highestDegree = formData.education
  if (formData.institution !== undefined) education.institution = formData.institution
  if (formData.occupation !== undefined) career.occupation = formData.occupation
  if (formData.companyName !== undefined) career.companyName = formData.companyName
  if (formData.annualIncome !== undefined) career.annualIncome = formData.annualIncome
  if (Object.keys(education).length) payload.education = education
  if (Object.keys(career).length) payload.career = career
  return payload
}

export const buildReligionPayload = (formData) => {
  const payload = {}
  if (formData.religion !== undefined) payload.religion = formData.religion
  if (formData.caste !== undefined) payload.caste = formData.caste
  if (formData.gotham !== undefined) payload.gotham = formData.gotham
  if (formData.rashi !== undefined) payload.rashi = formData.rashi
  if (formData.nakshtra !== undefined) payload.nakshtra = formData.nakshtra
  return payload
}

export const buildLifestylePayload = (formData) => {
  const lifestyle = {}
  if (formData.diet !== undefined) lifestyle.diet = formData.diet
  if (formData.smoking !== undefined) lifestyle.smoking = formData.smoking === "true"
  if (formData.drinking !== undefined) lifestyle.drinking = formData.drinking === "true"
  return Object.keys(lifestyle).length ? { lifestyle } : {}
}
