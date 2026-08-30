import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react"
import { forgotPassword } from "../api/authApi"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            await forgotPassword(email)
            setSuccess(true)
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FBF9F9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex justify-center mb-8">
                    <h2 className="text-3xl font-bold text-[#640515] font-serif">MeriJodi</h2>
                </Link>

                <div className="bg-white py-8 px-4 shadow-xl shadow-red-900/5 sm:rounded-3xl sm:px-10 border border-[#FFE4E8]">
                    <div className="mb-6">
                        <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                            <ArrowLeft size={16} className="mr-2" />
                            Back to login
                        </Link>
                        <h2 className="text-2xl font-bold text-gray-900 font-serif mb-2">Forgot Password</h2>
                        <p className="text-sm text-gray-600">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {success ? (
                        <div className="text-center py-6">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Check your email</h3>
                            <p className="text-sm text-gray-500 mb-8">
                                We've sent a password reset link to <strong>{email}</strong>.
                            </p>
                            <button
                                onClick={() => { setSuccess(false); setEmail("") }}
                                className="text-sm font-medium text-[#640515] hover:text-[#4a0410]"
                            >
                                Try another email address
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#640515] focus:border-[#640515] sm:text-sm transition-colors"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading || !email}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[#640515] hover:bg-[#4a0410] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#640515] disabled:opacity-50 transition-colors"
                                >
                                    {loading ? "Sending link..." : "Send Reset Link"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
