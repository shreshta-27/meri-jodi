import axiosInstance from "./axiosInstance"

const unwrap = (response) => response.data?.data ?? response.data

export const getSentInterests = async () => {
  const response = await axiosInstance.get("/interests/sent")
  return unwrap(response)
}

export const getReceivedInterests = async () => {
  const response = await axiosInstance.get("/interests/received")
  return unwrap(response)
}

export const sendInterest = async (receiverProfileId) => {
  const response = await axiosInstance.post("/interests", { receiverProfileId })
  return unwrap(response)
}

export const acceptInterest = async (interestId) => {
  const response = await axiosInstance.put(`/interests/${interestId}/accept`)
  return unwrap(response)
}

export const declineInterest = async (interestId) => {
  const response = await axiosInstance.put(`/interests/${interestId}/decline`)
  return unwrap(response)
}

export const withdrawInterest = async (interestId) => {
  const response = await axiosInstance.put(`/interests/${interestId}/withdraw`)
  return unwrap(response)
}
