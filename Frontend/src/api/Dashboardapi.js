import axiosInstance from "./axiosInstance"
import { getMyProfile } from "./profileApi"

const unwrap = (response) => response.data?.data ?? response.data

export const getRecommendedMatches = async (limit = 3) => {
  try {
    const response = await axiosInstance.get("/matches", { params: { limit } })
    const data = unwrap(response)
    return data?.matches ?? []
  } catch {
    return []
  }
}

export const getWhoViewedYou = async () => {
  return []
}

export { getMyProfile }
