import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { sendOtp } from "../api/authApi"
import signupImage from "../assets/login-image.png"
import logo from "../assets/logo2.png"

const SignUpPage = () => {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!phone.match(/^\d{10}$/)) {
      setError("Enter a valid 10-digit mobile number.")
      return
    }

    setLoading(true)
    try {
      await sendOtp(`+91${phone}`)
      navigate("/verify-otp", { state: { phone: `+91${phone}`, name } })
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Unable to send OTP, please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-white">
      <div className="h-screen w-5/12 hidden lg:block">
        <img src={signupImage} alt="banner image" className="h-full w-full object-cover" />
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-[#6B7280] text-sm">
              Join thousands of singles finding their perfect match
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#D1D5DB] px-4 py-3 text-sm"
            />
            <input
              type="text"
              placeholder="Enter 10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              maxLength={10}
              className="w-full rounded-lg border border-[#D1D5DB] px-4 py-3 text-sm"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#ED5463] py-3 text-white font-semibold hover:bg-[#D63E52] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending OTP..." : "Continue with OTP"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#6B7280]">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#ED5463] font-semibold hover:underline"
            >
              Sign in here
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
