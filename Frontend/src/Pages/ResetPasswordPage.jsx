import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react"
import { resetPassword } from "../api/authApi"

export default function ResetPasswordPage() {
    const { token } = useParams()
    const navigate = useNavigate()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (password.length < 6) {
            return setError("Password must be at least 6 characters long.")
        }
        if (password !== confirmPassword) {
            return setError("Passwords do not match.")
        }

        setLoading(true)
        try {
            await resetPassword(token, password)
            setSuccess(true)
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password. The link may have expired.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#FBF9F9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-10 px-4 shadow-xl shadow-red-900/5 sm:rounded-3xl sm:px-10 border border-[#FFE4E8] text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 font-serif mb-2">Password Reset Successful</h2>
                        <p className="text-sm text-gray-600 mb-8">
                            Your password has been successfully updated. You can now use your new password to log in.
                        </p>
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[#640515] hover:bg-[#4a0410] focus:outline-none transition-colors"
                        >
                            Continue to Login <ArrowRight size={16} className="ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FBF9F9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex justify-center mb-8">
                    <h2 className="text-3xl font-bold text-[#640515] font-serif">MeriJodi</h2>
                </Link>

                <div className="bg-white py-8 px-4 shadow-xl shadow-red-900/5 sm:rounded-3xl sm:px-10 border border-[#FFE4E8]">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 font-serif mb-2">Create New Password</h2>
                        <p className="text-sm text-gray-600">
                            Please enter your new password below.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#640515] focus:border-[#640515] sm:text-sm transition-colors"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#640515] focus:border-[#640515] sm:text-sm transition-colors"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading || !password || !confirmPassword}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[#640515] hover:bg-[#4a0410] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#640515] disabled:opacity-50 transition-colors"
                            >
                                {loading ? "Resetting Password..." : "Reset Password"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
