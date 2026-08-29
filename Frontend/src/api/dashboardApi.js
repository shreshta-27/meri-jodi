import axiosInstance from "./axiosInstance"
import { getMyProfile } from "./profileApi"

const unwrap = (response) => response.data?.data ?? response.data

export const getRecommendedMatches = async (limit = 3) => {
  try {
    const response = await axiosInstance.get("/matches", { params: { limit } })
    const data = unwrap(response)
    return data?.matches ?? (Array.isArray(data) ? data : [])
  } catch {
    return []
  }
}

export const getWhoViewedYou = async (limit = 10) => {
  try {
    const response = await axiosInstance.get("/profiles/who-viewed-me", { params: { limit } })
    const data = unwrap(response)
    return Array.isArray(data) ? data : (data?.viewers ?? [])
  } catch {
    return []
  }
}

export { getMyProfile }
