import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { getMe, logoutUser } from "../api/authApi"

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

    const signOut = useCallback(async () => {
        try {
            await logoutUser()
        } catch (e) {
            // ignore network errors on signout
        } finally {
            saveToken(null)
            setUser(null)
        }
    }, [saveToken])

    const refreshUser = useCallback(async () => {
        try {
            const data = await getMe()
            const fetchedUser = data.user ?? data
            setUser(fetchedUser)
            return fetchedUser
        } catch (err) {
            return null
        }
    }, [])

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

        return () => {
            cancelled = true
        }
    }, [token, saveToken])

    const isAuth = Boolean(token)

    return (
        <AuthContext.Provider value={{ user, token, isAuth, loading, signIn, signOut, logOut: signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext
