import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { loginWithEmail, loginWithGoogle } from "../api/authApi"
import logo from "../assets/logo2.png"

const LoginPage = () => {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!email || !password) {
      setError("Email and password are required")
      return
    }
    setLoading(true)
    try {
      const data = await loginWithEmail(email, password)
      signIn(data.token, data.user)
      navigate("/home")
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setLoading(true)
    try {
      alert("Google OAuth integration: Pass googleId, email, and name to the backend. For now, register via email or phone.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-white">
      <div className="h-screen w-5/12 hidden lg:block bg-gradient-to-br from-pink-100 to-pink-50">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-[#842029] mb-4">Welcome Back!</h2>
            <p className="text-[#6B7280] text-lg">Find your perfect match today</p>
          </div>
        </div>
      </div>
      <div className="px-8 sm:px-16 lg:px-20 py-8 w-full lg:flex-1 flex flex-col justify-center">
        <div className="mb-12">
          <img src={logo} alt="logo" className="h-10" />
        </div>
        <div className="max-w-md">
          <div className="mb-10">
            <button
              onClick={() => window.history.back()}
              className="text-sm text-[#6B7280] hover:text-[#374151] font-medium mb-6 flex items-center gap-1 transition-colors"
            >
              ← Go Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-[#6B7280] text-sm">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#D1D5DB] px-4 py-3 text-sm"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#D1D5DB] px-4 py-3 text-sm"
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#ED5463] py-3 text-white font-semibold hover:bg-[#D63E52] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-gray-400">or</span></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full rounded-full border border-gray-300 py-3 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-60"
          >
            Continue with Google
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/register")}
              className="text-[#ED5463] text-sm font-semibold hover:underline"
            >
              Sign up with phone (OTP)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
