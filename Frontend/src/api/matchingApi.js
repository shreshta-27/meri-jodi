import axiosInstance from "./axiosInstance"

const unwrap = (response) => response.data?.data ?? response.data

export const getMyMatches = async (pageOrOptions = 1, maybeLimit = 20) => {
  let params = {}
  if (typeof pageOrOptions === "object" && pageOrOptions !== null) {
    params = pageOrOptions
  } else {
    params = { page: pageOrOptions, limit: maybeLimit }
  }
  const response = await axiosInstance.get("/matches", { params })
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
