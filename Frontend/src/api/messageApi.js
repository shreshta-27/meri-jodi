import axiosInstance from "./axiosInstance"

const unwrap = (response) => response.data?.data ?? response.data

export const getConversations = async () => {
  const response = await axiosInstance.get("/messages/conversations")
  return unwrap(response)
}

export const getConversationHistory = async (profileId, page = 1, limit = 50) => {
  const response = await axiosInstance.get(`/messages/conversation/${profileId}`, {
    params: { page, limit },
  })
  return unwrap(response)
}

export const sendMessageRest = async (receiverProfileId, content) => {
  const response = await axiosInstance.post("/messages", { receiverProfileId, content })
  return unwrap(response)
}

export const getUnreadCount = async () => {
  const response = await axiosInstance.get("/messages/unread-count")
  return unwrap(response)
}

export const getChatSuggestions = async (partnerDetails, lastMessage = "", category = "icebreaker") => {
  const response = await axiosInstance.post("/extraction/chat-suggestions", {
    partnerDetails,
    lastMessage,
    category,
  })
  const data = unwrap(response)
  return data?.suggestions || data || []
}
