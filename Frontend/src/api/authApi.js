import axios from "axios"

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"
const AUTH_BASE = BASE.replace("/api/v1", "/api/auth")

const unwrap = (response) => response.data?.data ?? response.data

const getToken = () => localStorage.getItem("token")

const authApi = axios.create({
  baseURL: AUTH_BASE,
  timeout: 15000,
})

authApi.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const sendOtp = async (phone) => {
  const res = await authApi.post("/send-otp", { phone })
  return unwrap(res)
}

export const verifyOtp = async (phone, code, name) => {
  const res = await authApi.post("/verify-otp", { phone, code, name })
  return unwrap(res)
}

export const loginWithEmail = async (email, password) => {
  const res = await authApi.post("/login", { email, password })
  return unwrap(res)
}

export const loginWithGoogle = async (googleId, email, name) => {
  const res = await authApi.post("/google", { googleId, email, name })
  return unwrap(res)
}

export const getMe = async () => {
  const res = await authApi.get("/me")
  return unwrap(res)
}
