import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle, Clock, Heart, Trash2, ArrowLeft, MapPin, Briefcase } from "lucide-react"
import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import home1 from "../assets/home1.png"
import { getSentInterests, withdrawInterest } from "../api/interestApi"

const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    const dob = new Date(dateOfBirth)
    if (Number.isNaN(dob.getTime())) return null
    return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

const SentInterestCard = ({ interest, onWithdraw, onNavigate }) => {
    const profile = interest.receiverProfileId
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
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
                <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden mb-4 bg-gray-100">
                    <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3">
                        {isPending ? (
                            <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                                <Clock size={11} /> Pending
                            </span>
                        ) : isAccepted ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                                <CheckCircle size={11} /> Accepted
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-full bg-gray-500 text-white text-[10px] font-bold shadow-xs">
                                {interest.status}
                            </span>
                        )}
                    </div>
                </div>

                <h2 className="text-xl font-bold font-serif text-[#640515] mb-1">
                    {name}{age ? `, ${age}` : ""}
                </h2>
                <div className="text-xs text-gray-500 space-y-1 mb-3">
                    <p className="flex items-center gap-1">
                        <Briefcase size={13} className="text-[#842029]" /> {occupation}
                    </p>
                    <p className="flex items-center gap-1">
                        <MapPin size={13} className="text-[#842029]" /> {location}
                    </p>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                <p className="text-[10px] text-gray-400">
                    Sent on {new Date(interest.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                </p>

                <div className="flex gap-2">
                    {isAccepted ? (
                        <button
                            onClick={() => onNavigate(`/chat?profileId=${pId}`)}
                            className="flex-1 py-2.5 rounded-full bg-[#842029] text-white text-xs font-semibold hover:bg-[#6b1b27] transition-colors"
                        >
                            Send Message
                        </button>
                    ) : (
                        <button
                            onClick={() => onNavigate(`/match-details/${pId}`)}
                            className="flex-1 py-2.5 rounded-full border border-[#842029] text-[#842029] text-xs font-semibold hover:bg-[#842029] hover:text-white transition-colors"
                        >
                            View Profile
                        </button>
                    )}

                    {isPending && (
                        <button
                            onClick={() => onWithdraw(interest._id)}
                            title="Withdraw Interest"
                            className="px-3 py-2.5 rounded-full border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
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

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = await getSentInterests()
            const valid = (Array.isArray(data) ? data : []).filter(
                (item) => item && item.receiverProfileId && (item.receiverProfileId.name || item.receiverProfileId.userId)
            )
            setInterests(valid)
        } catch (err) {
            console.error("Failed to fetch sent interests:", err)
            setInterests([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleWithdraw = async (interestId) => {
        if (!window.confirm("Are you sure you want to withdraw this interest?")) return
        try {
            await withdrawInterest(interestId)
            setInterests((prev) => prev.filter((i) => i._id !== interestId))
            setToastMessage("Interest withdrawn successfully.")
            setTimeout(() => setToastMessage(""), 3000)
        } catch (err) {
            alert(err.response?.data?.message || "Failed to withdraw interest.")
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
                                onWithdraw={handleWithdraw}
                                onNavigate={navigate}
                            />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}
