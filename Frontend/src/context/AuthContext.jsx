import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { getMe } from "../api/authApi"

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)

  const saveToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem("token", newToken)
    } else {
      localStorage.removeItem("token")
    }
    setToken(newToken)
  }, [])

  const signIn = useCallback((newToken, userData) => {
    saveToken(newToken)
    setUser(userData)
  }, [saveToken])

  const signOut = useCallback(() => {
    saveToken(null)
    setUser(null)
  }, [saveToken])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    let cancelled = false
    getMe()
      .then((data) => {
        if (!cancelled) {
          setUser(data.user ?? data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          saveToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [token, saveToken])

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
