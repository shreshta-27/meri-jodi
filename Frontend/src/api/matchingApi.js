import axiosInstance from "./axiosInstance"

const unwrap = (response) => response.data?.data ?? response.data

export const getMyMatches = async (page = 1, limit = 20) => {
  const response = await axiosInstance.get("/matches", {
    params: { page, limit },
  })
  return unwrap(response)
}

export const searchProfiles = async (filters = {}) => {
  const response = await axiosInstance.get("/profiles/search", {
    params: filters,
  })
  return unwrap(response)
}

export const getProfileById = async (id) => {
  const response = await axiosInstance.get(`/profiles/${id}`)
  return unwrap(response)
}
