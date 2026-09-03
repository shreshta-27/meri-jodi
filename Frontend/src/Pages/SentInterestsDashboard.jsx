import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle, Clock, Heart, Trash2, MapPin, Briefcase, ExternalLink, MessageSquare, Check, X } from "lucide-react"
import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import ConfirmModal from "../Components/ConfirmModal"
import home1 from "../assets/home1.png"
import { getSentInterests, withdrawInterest } from "../api/interestApi"

const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    const dob = new Date(dateOfBirth)
    if (Number.isNaN(dob.getTime())) return null
    return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

const SentInterestCard = ({ interest, onWithdraw, onNavigate }) => {
    const profile = interest.recipientProfileId
    if (!profile) return null

    const pId = profile._id || profile.id
    const name = profile.name || profile.userId?.name || "MeriJodi Member"
    const age = calculateAge(profile.dateOfBirth)
    const photoUrl =
        profile.photos?.find((p) => p.isPrimary)?.url ||
        profile.photos?.[0]?.url ||
        home1
    const occupation = profile.career?.occupation || "Professional"
    const location = profile.location?.city || "India"
    const isPending = interest.status?.toLowerCase() === "pending"
    const isAccepted = interest.status?.toLowerCase() === "accepted"
    const isDeclined = interest.status?.toLowerCase() === "declined"

    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 mb-4">
                    <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3">
                        {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                                <Clock size={12} /> Pending Response
                            </span>
                        )}
                        {isAccepted && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                <Check size={12} /> Connected
                            </span>
                        )}
                        {isDeclined && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 shadow-2xs">
                                <X size={12} /> Declined
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 leading-tight">
                            {name}
                            {age ? `, ${age}` : ""}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                                <MapPin size={13} className="text-gray-400" />
                                {location}
                            </span>
                            <span className="flex items-center gap-1">
                                <Briefcase size={13} className="text-gray-400" />
                                {occupation}
                            </span>
                        </div>
                    </div>
                </div>

                {interest.message && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 italic border border-gray-100">
                        "{interest.message}"
                    </div>
                )}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-400">
                    Sent {new Date(interest.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </span>

                <div className="flex items-center gap-2">
                    {isAccepted && (
                        <button
                            onClick={() => onNavigate(`/chat?recipientId=${profile.userId?._id || profile.userId}`)}
                            className="px-3.5 py-1.5 rounded-full bg-[#842029] text-white text-xs font-semibold hover:bg-[#6b1b27] transition-colors flex items-center gap-1.5"
                        >
                            <MessageSquare size={13} /> Chat
                        </button>
                    )}
                    {isPending && (
                        <button
                            onClick={() => onWithdraw(interest._id)}
                            className="px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 hover:text-red-600 transition-colors"
                        >
                            Withdraw
                        </button>
                    )}
                    <button
                        onClick={() => onNavigate(`/profile/${pId}`)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-[#842029] hover:bg-rose-50 transition-colors"
                        title="View Profile"
                    >
                        <ExternalLink size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function SentInterestsDashboard() {
    const navigate = useNavigate()
    const [interests, setInterests] = useState([])
    const [loading, setLoading] = useState(true)
    const [toastMessage, setToastMessage] = useState("")
    const [withdrawTarget, setWithdrawTarget] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = await getSentInterests()
            setInterests(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Failed to fetch sent interests:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const triggerWithdraw = (interestId) => {
        setWithdrawTarget(interestId)
    }

    const confirmWithdraw = async () => {
        if (!withdrawTarget) return
        setActionLoading(true)
        try {
            await withdrawInterest(withdrawTarget)
            setInterests((prev) => prev.filter((i) => i._id !== withdrawTarget))
            setToastMessage("Interest withdrawn successfully.")
            setWithdrawTarget(null)
            setTimeout(() => setToastMessage(""), 3000)
        } catch (err) {
            setToastMessage(err.response?.data?.message || "Failed to withdraw interest.")
            setTimeout(() => setToastMessage(""), 3000)
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FBF9F9] flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#842029] mb-1">
                            <Heart size={14} fill="currentColor" /> My Sent Connections
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#640515]">
                            Sent Interests
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Track and manage the interest requests you have sent to members.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate("/interests-received")}
                            className="px-5 py-2 rounded-full border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
                        >
                            View Received Interests
                        </button>
                    </div>
                </div>

                {toastMessage && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-medium animate-in fade-in">
                        {toastMessage}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading sent interests...</div>
                ) : interests.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center max-w-xl mx-auto my-10">
                        <div className="w-16 h-16 rounded-full bg-[#FFF0F2] text-[#842029] flex items-center justify-center mx-auto mb-4">
                            <Heart size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 font-serif mb-2">
                            No Sent Interests
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">
                            You haven't expressed interest in any profiles yet. Browse matches to find someone special.
                        </p>
                        <button
                            onClick={() => navigate("/browse-matches")}
                            className="px-8 py-3 rounded-full bg-[#842029] text-white font-semibold text-xs sm:text-sm hover:bg-[#6b1b27] transition-all shadow-xs"
                        >
                            Browse Recommended Matches
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {interests.map((interest) => (
                            <SentInterestCard
                                key={interest._id}
                                interest={interest}
                                onWithdraw={triggerWithdraw}
                                onNavigate={navigate}
                            />
                        ))}
                    </div>
                )}
            </main>
            <Footer />

            {/* Custom Branded Confirmation Popup */}
            <ConfirmModal
                isOpen={Boolean(withdrawTarget)}
                title="Withdraw Interest?"
                message="Are you sure you want to withdraw this connection request? The member will no longer see your pending request."
                confirmText="Withdraw Interest"
                cancelText="Keep Sent"
                type="danger"
                loading={actionLoading}
                onConfirm={confirmWithdraw}
                onCancel={() => setWithdrawTarget(null)}
            />
        </div>
    )
}
