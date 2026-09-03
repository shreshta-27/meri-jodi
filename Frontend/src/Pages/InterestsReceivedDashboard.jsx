import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check, X, Heart, MessageSquare, MapPin, Briefcase, Sparkles } from "lucide-react"
import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import ConfirmModal from "../Components/ConfirmModal"
import home1 from "../assets/home1.png"
import { getReceivedInterests, acceptInterest, declineInterest } from "../api/interestApi"

const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    const dob = new Date(dateOfBirth)
    if (Number.isNaN(dob.getTime())) return null
    return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

const ReceivedInterestCard = ({ interest, onAccept, onDecline, onNavigate }) => {
    const profile = interest.senderProfileId
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

    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-6">
            <div className="relative w-full sm:w-44 md:w-48 aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#640515]">
                                {name}{age ? `, ${age}` : ""}
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-3">
                                <span>📍 {location}</span>
                                <span>💼 {occupation}</span>
                                {profile.religion && <span>🛕 {profile.religion}</span>}
                            </p>
                        </div>

                        {isAccepted && (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
                                Accepted
                            </span>
                        )}
                    </div>

                    {profile.aboutMe && (
                        <div className="mt-3 p-3.5 bg-gray-50/70 rounded-2xl text-xs sm:text-sm text-gray-600 italic line-clamp-2">
                            "{profile.aboutMe}"
                        </div>
                    )}
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] text-gray-400">
                        Received on {new Date(interest.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                    </span>

                    <div className="flex items-center gap-2">
                        {isPending ? (
                            <>
                                <button
                                    onClick={() => onDecline(interest._id)}
                                    className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1"
                                >
                                    <X size={14} /> Decline
                                </button>
                                <button
                                    onClick={() => onAccept(interest._id)}
                                    className="px-6 py-2 rounded-full bg-[#842029] text-white text-xs font-semibold hover:bg-[#6b1b27] transition-colors flex items-center gap-1 shadow-xs"
                                >
                                    <Check size={14} /> Accept Interest
                                </button>
                            </>
                        ) : isAccepted ? (
                            <button
                                onClick={() => onNavigate(`/chat?profileId=${pId}`)}
                                className="px-6 py-2 rounded-full bg-[#842029] text-white text-xs font-semibold hover:bg-[#6b1b27] transition-colors flex items-center gap-1.5"
                            >
                                <MessageSquare size={14} /> Send Message
                            </button>
                        ) : null}

                        <button
                            onClick={() => onNavigate(`/match-details/${pId}`)}
                            className="px-4 py-2 rounded-full border border-[#842029] text-[#842029] text-xs font-semibold hover:bg-[#842029] hover:text-white transition-colors"
                        >
                            View Full Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function InterestsReceivedDashboard() {
    const navigate = useNavigate()
    const [interests, setInterests] = useState([])
    const [loading, setLoading] = useState(true)
    const [toastMessage, setToastMessage] = useState("")
    const [declineTarget, setDeclineTarget] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = await getReceivedInterests()
            setInterests(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Failed to fetch received interests:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleAccept = async (interestId) => {
        setActionLoading(true)
        try {
            await acceptInterest(interestId)
            setToastMessage("Interest accepted! You can now send messages.")
            await fetchData()
            setTimeout(() => setToastMessage(""), 3500)
        } catch (err) {
            setToastMessage(err.response?.data?.message || "Failed to accept interest.")
            setTimeout(() => setToastMessage(""), 3500)
        } finally {
            setActionLoading(false)
        }
    }

    const triggerDecline = (interestId) => {
        setDeclineTarget(interestId)
    }

    const confirmDecline = async () => {
        if (!declineTarget) return
        setActionLoading(true)
        try {
            await declineInterest(declineTarget)
            setToastMessage("Interest declined.")
            setDeclineTarget(null)
            await fetchData()
            setTimeout(() => setToastMessage(""), 3500)
        } catch (err) {
            setToastMessage(err.response?.data?.message || "Failed to decline interest.")
            setTimeout(() => setToastMessage(""), 3500)
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FBF9F9] flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#842029] mb-1">
                            <Sparkles size={14} /> Connection Requests
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#640515]">
                            Interests Received
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Review and respond to members who have expressed interest in your profile.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate("/sent-interests")}
                            className="px-5 py-2 rounded-full border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
                        >
                            View Sent Interests
                        </button>
                    </div>
                </div>

                {toastMessage && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-medium animate-in fade-in">
                        {toastMessage}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading received interests...</div>
                ) : interests.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center max-w-xl mx-auto my-10">
                        <div className="w-16 h-16 rounded-full bg-[#FFF0F2] text-[#842029] flex items-center justify-center mx-auto mb-4">
                            <Heart size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 font-serif mb-2">
                            No Received Interests Yet
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">
                            When other members express interest in your profile, their requests will appear here.
                        </p>
                        <button
                            onClick={() => navigate("/browse-matches")}
                            className="px-8 py-3 rounded-full bg-[#842029] text-white font-semibold text-xs sm:text-sm hover:bg-[#6b1b27] transition-all shadow-xs"
                        >
                            Browse Matches
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {interests.map((interest) => (
                            <ReceivedInterestCard
                                key={interest._id}
                                interest={interest}
                                onAccept={handleAccept}
                                onDecline={triggerDecline}
                                onNavigate={navigate}
                            />
                        ))}
                    </div>
                )}
            </main>
            <Footer />

            {/* Custom Branded Confirmation Popup */}
            <ConfirmModal
                isOpen={Boolean(declineTarget)}
                title="Decline Interest?"
                message="Are you sure you want to decline this connection request? This member will no longer be listed in your active requests."
                confirmText="Decline Interest"
                cancelText="Keep Pending"
                type="danger"
                loading={actionLoading}
                onConfirm={confirmDecline}
                onCancel={() => setDeclineTarget(null)}
            />
        </div>
    )
}
