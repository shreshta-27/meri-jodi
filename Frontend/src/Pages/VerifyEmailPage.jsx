import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { verifyEmailToken } from "../api/authApi"
import logo from "../assets/logo2.png"

const VerifyEmailPage = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const { signIn } = useAuth()

    const [status, setStatus] = useState("verifying") // 'verifying' | 'success' | 'error'
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (!token) {
            setStatus("error")
            setMessage("Invalid verification link. Token is missing.")
            return
        }

        let isMounted = true
        verifyEmailToken(token)
            .then((data) => {
                if (isMounted) {
                    setStatus("success")
                    setMessage(data.message || "Your email has been verified successfully!")
                    if (data.token || data.accessToken) {
                        signIn(data.token || data.accessToken, data.user)
                    }
                    // Redirect to profile setup after 3 seconds
                    setTimeout(() => {
                        navigate("/complete-profile")
                    }, 3000)
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setStatus("error")
                    setMessage(
                        err.response?.data?.message ||
                            "Verification link has expired or is invalid. Please sign up or request a new link."
                    )
                }
            })

        return () => {
            isMounted = false
        }
    }, [token, signIn, navigate])

    return (
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#FFE4E8] p-8 sm:p-10 text-center">
                <img src={logo} alt="MeriJodi" className="h-10 mx-auto mb-6" />

                {status === "verifying" && (
                    <div className="py-8">
                        <div className="w-14 h-14 border-4 border-[#FFE4E8] border-t-[#ED5463] rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2 font-serif">Verifying Your Email...</h2>
                        <p className="text-sm text-[#6B7280]">
                            Please hold on while we verify your account credentials.
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="py-6">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">
                            ✓
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Account Verified!</h2>
                        <p className="text-sm text-[#4B5563] mb-6">{message}</p>
                        <p className="text-xs text-[#9CA3AF] mb-6">Redirecting to your profile setup in a few seconds...</p>
                        <button
                            onClick={() => navigate("/complete-profile")}
                            className="w-full rounded-full bg-[#ED5463] py-3 text-white font-semibold text-sm hover:bg-[#D4384B] transition-all shadow-md"
                        >
                            Continue to Profile Setup →
                        </button>
                    </div>
                )}

                {status === "error" && (
                    <div className="py-6">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">
                            ⚠️
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Verification Failed</h2>
                        <p className="text-sm text-[#4B5563] mb-6">{message}</p>
                        <div className="space-y-3">
                            <Link
                                to="/register"
                                className="block w-full rounded-full bg-[#ED5463] py-3 text-white font-semibold text-sm hover:bg-[#D4384B] transition-all shadow-md"
                            >
                                Create New Account
                            </Link>
                            <Link
                                to="/login"
                                className="block w-full rounded-full border border-gray-300 py-3 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"
                            >
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VerifyEmailPage
