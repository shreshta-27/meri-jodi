import { useRef, useState, useEffect } from "react"
import {
    Heart,
    Star,
    Eye,
    Sparkles,
    MapPinned,
    ChevronRight,
    ChevronDown,
    SlidersHorizontal,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import home1 from "../assets/home1.png"
import { getMyMatches } from "../api/matchingApi"
import { sendInterest } from "../api/interestApi"
import { toggleShortlist, getShortlistedProfiles } from "../api/shortlistApi"

const COLORS = {
    pageBg: "#FBF9F9",
    maroon: "#640515",
    accentRed: "#AE2539",
    badgeCoral: "#ED5463",
    pillBg: "#FFDAD9",
    activeBg: "#FCEFF0",
    borderGray: "#F5F3F3",
    bodyGray: "#6B6F72",
}

const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    const dob = new Date(dateOfBirth)
    if (Number.isNaN(dob.getTime())) return null
    return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

const mapProfileToCard = (profile) => ({
    id: profile._id,
    name: profile.name || profile.userId?.name || "MeriJodi Member",
    age: calculateAge(profile.dateOfBirth),
    match: profile.compatibilityScore,
    location: profile.location?.city || "India",
    education: profile.education?.highestDegree || "",
    occupation: profile.career?.occupation || "Professional",
    tags: [profile.religion, profile.caste, profile.lifestyle?.diet].filter(Boolean),
    quote: profile.aboutMe ? `"${profile.aboutMe.slice(0, 140)}..."` : "",
    image:
        profile.photos?.find((p) => p.isPrimary)?.url ||
        profile.photos?.[0]?.url ||
        home1,
})

const MatchCard = ({
    id,
    image,
    name,
    age,
    match,
    location,
    education,
    occupation,
    tags = [],
    quote,
    isShortlisted,
    onToggleShortlist,
    onSendInterest,
    onViewProfile,
}) => (
    <div
        className="relative bg-white rounded-3xl border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 shadow-xs hover:shadow-md transition-all"
    >
        <div className="relative w-full sm:w-44 md:w-52 h-64 sm:h-auto self-stretch shrink-0 rounded-2xl overflow-hidden bg-gray-100">
            <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            {typeof match === "number" && (
                <span
                    className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white shadow"
                    style={{ backgroundColor: COLORS.badgeCoral }}
                >
                    <Star className="w-3 h-3" fill="#fff" color="#fff" />
                    {match}% Match
                </span>
            )}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onToggleShortlist(id)
                }}
                title={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
                className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-xs transition-all shadow-xs ${
                    isShortlisted
                        ? "bg-amber-500 text-white"
                        : "bg-white/80 text-gray-600 hover:bg-white hover:text-amber-500"
                }`}
            >
                <Star size={16} fill={isShortlisted ? "currentColor" : "none"} />
            </button>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#640515]">
                    {name}{typeof age === "number" ? `, ${age}` : ""}
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs sm:text-sm text-gray-600">
                    {location && <span>📍 {location}</span>}
                    {education && <span>🎓 {education}</span>}
                    {occupation && <span>💼 {occupation}</span>}
                </div>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-xs font-medium px-3 py-1 rounded-full bg-[#FFF0F2] text-[#842029]"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
                {quote && (
                    <div className="rounded-2xl px-4 py-3 mt-3 text-xs sm:text-sm italic leading-relaxed text-gray-700 bg-gray-50/80">
                        {quote}
                    </div>
                )}
            </div>

            <div className="flex gap-3 mt-5 pt-3 border-t border-gray-50">
                <button
                    type="button"
                    onClick={onSendInterest}
                    className="flex-1 rounded-full py-2.5 text-xs sm:text-sm font-semibold text-white hover:opacity-90 transition-opacity bg-[#AE2539] shadow-xs flex items-center justify-center gap-1.5"
                >
                    <Heart size={14} fill="currentColor" /> Express Interest
                </button>
                <button
                    type="button"
                    onClick={onViewProfile}
                    className="flex-1 rounded-full py-2.5 text-xs sm:text-sm font-semibold border border-[#AE2539] text-[#AE2539] hover:bg-[#AE2539] hover:text-white transition-colors"
                >
                    View Profile
                </button>
            </div>
        </div>
    </div>
)

const SidebarRow = ({ label, subtitle, icon: Icon, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-start gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors ${
            active ? "bg-[#FFF0F2] text-[#842029]" : "hover:bg-gray-50 text-gray-800"
        }`}
    >
        <Icon className="w-4 h-4 mt-0.5 shrink-0 text-[#842029]" />
        <span className="flex-1 min-w-0">
            <span className={`block text-xs sm:text-sm font-bold ${active ? "text-[#842029]" : "text-gray-800"}`}>
                {label}
            </span>
            <span className="block text-[11px] mt-0.5 text-gray-500 leading-snug">
                {subtitle}
            </span>
        </span>
        {active && <ChevronRight className="w-4 h-4 shrink-0 mt-0.5 text-[#842029]" />}
    </button>
)

const sidebarLinks = [
    { label: "Your Matches", subtitle: "All profiles matching your preferences", icon: Heart },
    { label: "Short Listed By You", subtitle: "Profiles you have saved", icon: Star },
    { label: "Viewed you", subtitle: "Profiles who viewed your biodata", icon: Eye },
    { label: "Newly Joined", subtitle: "Joined in the last 30 days", icon: Sparkles },
    { label: "Nearby Matches", subtitle: "Matches in your state / city", icon: MapPinned },
]

export default function BrowseMatchScreen() {
    const navigate = useNavigate()
    const [matches, setMatches] = useState([])
    const [shortlistedIds, setShortlistedIds] = useState(new Set())
    const [loading, setLoading] = useState(true)
    const [visibleCount, setVisibleCount] = useState(6)
    const [activeFilter, setActiveFilter] = useState("All")
    const [toastMessage, setToastMessage] = useState("")

    const showToast = (msg) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(""), 3500)
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const [matchResult, shortlists] = await Promise.all([
                getMyMatches({ limit: 40 }),
                getShortlistedProfiles().catch(() => []),
            ])
            setMatches((matchResult?.matches ?? []).map(mapProfileToCard))
            const sIds = new Set(
                shortlists.map((s) => {
                    const p = s.shortlistedProfileId
                    return typeof p === "object" ? p._id : p
                })
            )
            setShortlistedIds(sIds)
        } catch (err) {
            console.error("Failed to fetch matches:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSendInterest = async (profileId) => {
        try {
            await sendInterest(profileId)
            showToast("Interest sent successfully!")
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to send interest"
            showToast(msg)
        }
    }

    const handleToggleShortlist = async (profileId) => {
        try {
            const res = await toggleShortlist(profileId)
            const added = res?.action === "added"
            setShortlistedIds((prev) => {
                const next = new Set(prev)
                if (added) next.add(profileId)
                else next.delete(profileId)
                return next
            })
            showToast(added ? "Profile saved to shortlist!" : "Removed from shortlist.")
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to update shortlist.")
        }
    }

    const PAGE_SIZE = 4
    const loadMoreMatches = () => {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, matches.length))
    }

    return (
        <div className="min-h-screen bg-[#FBF9F9] font-sans flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
                {toastMessage && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-medium animate-in fade-in">
                        {toastMessage}
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Left Filter Sidebar */}
                    <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-3xl bg-white p-4 border border-gray-100 shadow-xs space-y-1">
                            <h2 className="px-3 pt-2 pb-3 font-serif font-bold text-lg text-[#640515]">
                                Match Filters
                            </h2>
                            {sidebarLinks.map((l, i) => (
                                <SidebarRow
                                    key={l.label}
                                    {...l}
                                    active={i === 0}
                                    onClick={() => {
                                        if (l.label === "Short Listed By You") navigate("/shortlist")
                                        else if (l.label === "Viewed you") navigate("/home")
                                    }}
                                />
                            ))}
                        </div>
                    </aside>

                    {/* Main Match List */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#640515]">
                                    Recommended Matches
                                </h1>
                                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                                    High-compatibility profiles tailored to your partner preferences.
                                </p>
                            </div>
                        </div>

                        {/* Quick filter chips */}
                        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
                            {["All Matches", "Profiles with photo", "Newly Joined", "Same City", "Verified"].map(
                                (chip) => (
                                    <button
                                        key={chip}
                                        type="button"
                                        onClick={() => setActiveFilter(chip)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                                            activeFilter === chip
                                                ? "bg-[#842029] text-white border-[#842029]"
                                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                        }`}
                                    >
                                        {chip}
                                    </button>
                                )
                            )}
                        </div>

                        {loading ? (
                            <div className="py-20 text-center text-gray-500">Loading matches...</div>
                        ) : matches.length === 0 ? (
                            <div className="mt-8 bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                                <p className="text-gray-500 text-sm">
                                    No matches found for your current preferences. Try adjusting your age or location filters.
                                </p>
                                <button
                                    onClick={() => navigate("/profile")}
                                    className="mt-4 px-6 py-2 rounded-full bg-[#842029] text-white text-xs font-semibold hover:bg-[#6b1b27]"
                                >
                                    Adjust Partner Preferences
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="mt-6 space-y-6">
                                    {matches.slice(0, visibleCount).map((m) => (
                                        <MatchCard
                                            key={m.id}
                                            {...m}
                                            isShortlisted={shortlistedIds.has(m.id)}
                                            onToggleShortlist={handleToggleShortlist}
                                            onSendInterest={() => handleSendInterest(m.id)}
                                            onViewProfile={() => navigate(`/match-details/${m.id}`)}
                                        />
                                    ))}
                                </div>

                                {visibleCount < matches.length && (
                                    <div className="flex justify-center mt-8 mb-6">
                                        <button
                                            onClick={loadMoreMatches}
                                            className="px-8 py-3 rounded-full border-2 border-[#AE2539] text-[#AE2539] font-semibold text-xs sm:text-sm hover:bg-[#AE2539] hover:text-white transition-all shadow-xs"
                                        >
                                            Load More Matches ({matches.length - visibleCount} remaining)
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
