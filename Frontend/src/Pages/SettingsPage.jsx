import { useState, useEffect } from "react"
import { Shield, Key, Ban, ChevronRight, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import { useAuth } from "../context/AuthContext"
import { changePassword } from "../api/authApi"
import { getBlockedProfiles, unblockProfile } from "../api/blockApi"
import { useToast } from "../context/ToastContext"

export default function SettingsPage() {
    const { user, logOut } = useAuth()
    const navigate = useNavigate()
    const addToast = useToast()
    const [activeTab, setActiveTab] = useState("account")
    
    // Change Password State
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
    
    // Blocked Users State
    const [blockedUsers, setBlockedUsers] = useState([])
    const [isLoadingBlocked, setIsLoadingBlocked] = useState(false)

    useEffect(() => {
        if (activeTab === "blocked") {
            fetchBlockedUsers()
        }
    }, [activeTab])

    const fetchBlockedUsers = async () => {
        setIsLoadingBlocked(true)
        try {
            const data = await getBlockedProfiles()
            setBlockedUsers(data)
        } catch (err) {
            addToast("Failed to load blocked users", "error")
        } finally {
            setIsLoadingBlocked(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            return addToast("New passwords do not match", "error")
        }
        if (newPassword.length < 6) {
            return addToast("Password must be at least 6 characters", "error")
        }

        setIsSubmittingPassword(true)
        try {
            await changePassword(currentPassword, newPassword)
            addToast("Password updated successfully", "success")
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (err) {
            addToast(err.response?.data?.message || "Failed to update password", "error")
        } finally {
            setIsSubmittingPassword(false)
        }
    }

    const handleUnblock = async (profileId) => {
        try {
            await unblockProfile(profileId)
            addToast("User unblocked successfully", "success")
            setBlockedUsers(blockedUsers.filter(u => u.blockedProfileId?._id !== profileId))
        } catch (err) {
            addToast("Failed to unblock user", "error")
        }
    }

    const handleLogout = async () => {
        try {
            await logOut()
            navigate("/login")
        } catch (err) {
            addToast("Failed to logout", "error")
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            
            <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 font-serif mb-6">Settings</h1>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => setActiveTab("account")}
                                className={`w-full flex items-center justify-between p-4 text-sm font-medium transition-colors ${
                                    activeTab === "account" ? "bg-red-50 text-red-700 border-l-4 border-red-600" : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Shield size={18} /> Account & Privacy
                                </div>
                                <ChevronRight size={16} className={activeTab === "account" ? "text-red-400" : "text-gray-400"} />
                            </button>
                            <button
                                onClick={() => setActiveTab("blocked")}
                                className={`w-full flex items-center justify-between p-4 text-sm font-medium transition-colors ${
                                    activeTab === "blocked" ? "bg-red-50 text-red-700 border-l-4 border-red-600" : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Ban size={18} /> Blocked Members
                                </div>
                                <ChevronRight size={16} className={activeTab === "blocked" ? "text-red-400" : "text-gray-400"} />
                            </button>
                            <div className="p-4 border-t border-gray-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 text-sm font-medium text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                            
                            {/* Account Tab */}
                            {activeTab === "account" && (
                                <div className="space-y-8 animate-in fade-in">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 font-serif mb-1 flex items-center gap-2">
                                            <Key size={20} className="text-gray-400" /> Change Password
                                        </h2>
                                        <p className="text-sm text-gray-500 mb-6">Update your password to keep your account secure.</p>
                                        
                                        {!user?.passwordHash && user?.googleId ? (
                                            <div className="p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 text-sm">
                                                You signed in using Google. Password changes are managed through your Google account.
                                            </div>
                                        ) : (
                                            <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Current Password</label>
                                                    <input
                                                        type="password"
                                                        required
                                                        value={currentPassword}
                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-red-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Password</label>
                                                    <input
                                                        type="password"
                                                        required
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-red-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        required
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-red-500 outline-none"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmittingPassword}
                                                    className="w-full py-2.5 bg-[#640515] text-white text-sm font-semibold rounded-xl hover:bg-[#4a0410] disabled:opacity-50 transition-colors"
                                                >
                                                    {isSubmittingPassword ? "Updating..." : "Update Password"}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                    
                                    <hr className="border-gray-100" />
                                    
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 font-serif mb-1 text-red-600">Danger Zone</h2>
                                        <p className="text-sm text-gray-500 mb-4">Permanent actions regarding your account.</p>
                                        <button className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors">
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Blocked Tab */}
                            {activeTab === "blocked" && (
                                <div className="animate-in fade-in">
                                    <h2 className="text-lg font-bold text-gray-900 font-serif mb-1 flex items-center gap-2">
                                        <Ban size={20} className="text-gray-400" /> Blocked Members
                                    </h2>
                                    <p className="text-sm text-gray-500 mb-6">Members you have blocked cannot see your profile or contact you.</p>

                                    {isLoadingBlocked ? (
                                        <div className="py-12 text-center text-gray-500 text-sm">Loading blocked members...</div>
                                    ) : blockedUsers.length === 0 ? (
                                        <div className="py-12 text-center bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-gray-500 text-sm">You haven't blocked anyone.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {blockedUsers.map((block) => (
                                                <div key={block._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                                            {block.blockedProfileId?.photos?.[0]?.url ? (
                                                                <img src={block.blockedProfileId.photos[0].url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white text-xs">No Pic</div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {block.blockedProfileId?.name || "MeriJodi Member"}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Blocked on {new Date(block.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleUnblock(block.blockedProfileId?._id)}
                                                        className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                    >
                                                        Unblock
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
