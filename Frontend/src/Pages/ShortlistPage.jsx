import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Star, Heart, Trash2, MapPin, Briefcase, GraduationCap, ArrowRight } from "lucide-react"
import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import home1 from "../assets/home1.png"
import { getShortlistedProfiles, toggleShortlist } from "../api/shortlistApi"
import { sendInterest } from "../api/interestApi"

const COLORS = {
    pageBg: "#FBF9F9",
    maroon: "#640515",
    accentRed: "#AE2539",
    borderTone: "#E0BEBF",
}

const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    const dob = new Date(dateOfBirth)
    if (Number.isNaN(dob.getTime())) return null
    return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

export default function ShortlistPage() {
    const navigate = useNavigate()
    const [shortlists, setShortlists] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionMsg, setActionMsg] = useState("")

    const fetchShortlists = async () => {
        setLoading(true)
        try {
            const data = await getShortlistedProfiles()
            setShortlists(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Failed to load shortlists:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchShortlists()
    }, [])

    const handleRemove = async (profileId) => {
        try {
            await toggleShortlist(profileId)
            setShortlists((prev) =>
                prev.filter((item) => {
                    const pId = typeof item.shortlistedProfileId === "object"
                        ? item.shortlistedProfileId._id
                        : item.shortlistedProfileId
                    return pId !== profileId
                })
            )
            setActionMsg("Profile removed from your shortlist.")
            setTimeout(() => setActionMsg(""), 3000)
        } catch (err) {
            alert(err.response?.data?.message || "Failed to remove from shortlist.")
        }
    }

    const handleSendInterest = async (profileId) => {
        try {
            await sendInterest(profileId)
            setActionMsg("Interest expressed successfully!")
            setTimeout(() => setActionMsg(""), 3000)
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send interest.")
        }
    }

    return (
        <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: COLORS.pageBg }}>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#842029] mb-1">
                        <Star size={14} fill="currentColor" /> My Bookmarks
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#640515]">
                        Shortlisted Profiles
                    </h1>
                    <p className="text-gray-600 text-sm mt-2">
                        Profiles you have saved to review and connect with later.
                    </p>
                </div>

                {actionMsg && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-medium animate-in fade-in">
                        {actionMsg}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-20 text-gray-500">
                        Loading your shortlisted matches...
                    </div>
                ) : shortlists.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center max-w-xl mx-auto my-12">
                        <div className="w-16 h-16 rounded-full bg-[#FFF0F2] text-[#842029] flex items-center justify-center mx-auto mb-4">
                            <Star size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 font-serif mb-2">
                            No Shortlisted Profiles Yet
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">
                            Browse through our verified matches and tap the star icon to save profiles you're interested in.
                        </p>
                        <button
                            onClick={() => navigate("/browse-matches")}
                            className="px-8 py-3 rounded-full bg-[#842029] text-white font-semibold text-sm hover:bg-[#6b1b27] transition-all shadow-sm"
                        >
                            Explore Recommended Matches
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shortlists.map((item) => {
                            const profile = item.shortlistedProfileId
                            if (!profile) return null

                            const pId = profile._id || profile.id
                            const name = profile.name || profile.userId?.name || "MeriJodi Member"
                            const age = calculateAge(profile.dateOfBirth)
                            const photo =
                                profile.photos?.find((p) => p.isPrimary)?.url ||
                                profile.photos?.[0]?.url ||
                                home1
                            const location = profile.location?.city || "India"
                            const occupation = profile.career?.occupation || "Professional"
                            const degree = profile.education?.highestDegree || ""

                            return (
                                <div
                                    key={item._id}
                                    className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                                >
                                    <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
                                        <img
                                            src={photo}
                                            alt={name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <button
                                            onClick={() => handleRemove(pId)}
                                            title="Remove from Shortlist"
                                            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs text-red-600 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-[#640515] font-serif">
                                                {name}{age ? `, ${age}` : ""}
                                            </h2>
                                            <div className="mt-2 space-y-1.5 text-xs text-gray-600">
                                                <p className="flex items-center gap-1.5">
                                                    <Briefcase size={14} className="text-[#842029]" />
                                                    {occupation}
                                                </p>
                                                {degree && (
                                                    <p className="flex items-center gap-1.5">
                                                        <GraduationCap size={14} className="text-[#842029]" />
                                                        {degree}
                                                    </p>
                                                )}
                                                <p className="flex items-center gap-1.5">
                                                    <MapPin size={14} className="text-[#842029]" />
                                                    {location}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
                                            <button
                                                onClick={() => handleSendInterest(pId)}
                                                className="flex-1 py-2.5 rounded-full bg-[#842029] text-white text-xs font-semibold hover:bg-[#6b1b27] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                                            >
                                                <Heart size={14} fill="currentColor" /> Express Interest
                                            </button>
                                            <button
                                                onClick={() => navigate(`/match-details/${pId}`)}
                                                className="px-4 py-2.5 rounded-full border border-[#842029] text-[#842029] text-xs font-semibold hover:bg-[#842029] hover:text-white transition-colors"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}
