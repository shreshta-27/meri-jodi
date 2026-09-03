import { useState, useEffect, useMemo } from "react"
import {
    Heart,
    Star,
    Eye,
    Sparkles,
    MapPinned,
    ChevronRight,
    Search,
    SlidersHorizontal,
    CheckCircle,
    MessageSquare,
    Clock,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import home1 from "../assets/home1.png"
import { getMyMatches } from "../api/matchingApi"
import { getMyProfile } from "../api/profileApi"
import { sendInterest, getSentInterests, getReceivedInterests } from "../api/interestApi"
import { toggleShortlist, getShortlistedProfiles } from "../api/shortlistApi"
import { getWhoViewedYou } from "../api/dashboardApi"

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
    state: profile.location?.state || "",
    education: profile.education?.highestDegree || "",
    occupation: profile.career?.occupation || "Professional",
    tags: [profile.religion, profile.caste, profile.lifestyle?.diet].filter(Boolean),
    quote: profile.aboutMe ? `"${profile.aboutMe.slice(0, 140)}..."` : "",
    isVerified: !!profile.isVerified,
    hasPhoto: !!(profile.photos && profile.photos.length > 0 && profile.photos[0]?.url),
    createdAt: profile.createdAt ? new Date(profile.createdAt) : null,
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
    isVerified,
    isShortlisted,
    interestStatus,
    onToggleShortlist,
    onSendInterest,
    onViewProfile,
    onNavigateChat,
    onNavigateReceived,
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
            {isVerified && (
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow flex items-center gap-1">
                    <CheckCircle size={10} /> Verified
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
                <div className="flex items-center justify-between gap-2">
                    <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#640515]">
                        {name}{typeof age === "number" ? `, ${age}` : ""}
                    </h2>
                </div>
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
                {interestStatus === "accepted" ? (
                    <button
                        type="button"
                        onClick={onNavigateChat}
                        className="flex-1 rounded-full py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <MessageSquare size={14} /> Send Message
                    </button>
                ) : interestStatus === "pending" ? (
                    <button
                        type="button"
                        disabled
                        className="flex-1 rounded-full py-2.5 text-xs sm:text-sm font-semibold text-white bg-amber-500 opacity-90 shadow-xs flex items-center justify-center gap-1.5 cursor-default"
                    >
                        <Clock size={14} /> Interest Sent
                    </button>
                ) : interestStatus === "received_pending" ? (
                    <button
                        type="button"
                        onClick={onNavigateReceived}
                        className="flex-1 rounded-full py-2.5 text-xs sm:text-sm font-semibold text-white bg-rose-700 hover:bg-rose-800 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <Heart size={14} fill="currentColor" /> Respond to Interest
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onSendInterest}
                        className="flex-1 rounded-full py-2.5 text-xs sm:text-sm font-semibold text-white hover:opacity-90 transition-opacity bg-[#AE2539] shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <Heart size={14} fill="currentColor" /> Express Interest
                    </button>
                )}
                <button
                    type="button"
                    onClick={onViewProfile}
                    className="flex-1 rounded-full py-2.5 text-xs sm:text-sm font-semibold border border-[#AE2539] text-[#AE2539] hover:bg-[#AE2539] hover:text-white transition-colors cursor-pointer"
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
        className={`w-full flex items-start gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors cursor-pointer ${
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
    const [myProfile, setMyProfile] = useState(null)
    const [whoViewedYouList, setWhoViewedYouList] = useState([])
    const [shortlistedProfilesList, setShortlistedProfilesList] = useState([])
    const [shortlistedIds, setShortlistedIds] = useState(new Set())
    const [interestStatuses, setInterestStatuses] = useState({})
    const [loading, setLoading] = useState(true)
    const [visibleCount, setVisibleCount] = useState(6)
    const [activeSidebar, setActiveSidebar] = useState("Your Matches")
    const [activeFilter, setActiveFilter] = useState("All Matches")
    const [searchQuery, setSearchQuery] = useState("")
    const [toastMessage, setToastMessage] = useState("")

    const showToast = (msg) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(""), 3500)
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const [matchResult, shortlists, viewed, myProf, sentInterests, receivedInterests] = await Promise.all([
                getMyMatches({ limit: 50 }).catch(() => ({ matches: [] })),
                getShortlistedProfiles().catch(() => []),
                getWhoViewedYou(30).catch(() => []),
                getMyProfile().catch(() => null),
                getSentInterests().catch(() => []),
                getReceivedInterests().catch(() => []),
            ])
            setMatches(
                (matchResult?.matches ?? [])
                    .filter((m) => m && (m._id || m.id))
                    .map(mapProfileToCard)
            )
            setMyProfile(myProf)
            setWhoViewedYouList(
                (viewed || [])
                    .map((v) => v.profile || v)
                    .filter((p) => p && (p._id || p.id))
                    .map(mapProfileToCard)
            )
            setShortlistedProfilesList(
                (shortlists || [])
                    .map((s) => s.shortlistedProfileId || s)
                    .filter((p) => p && (p._id || p.id))
                    .map(mapProfileToCard)
            )

            const sIds = new Set(
                (shortlists || [])
                    .filter((s) => s && s.shortlistedProfileId)
                    .map((s) => {
                        const p = s.shortlistedProfileId
                        return typeof p === "object" ? p._id : p
                    })
                    .filter(Boolean)
            )
            setShortlistedIds(sIds)

            // Build interest map
            const intMap = {}
            for (const item of (sentInterests || [])) {
                const rId = typeof item.receiverProfileId === "object" ? item.receiverProfileId?._id : item.receiverProfileId
                if (rId) {
                    intMap[String(rId)] = item.status === "accepted" ? "accepted" : "pending"
                }
            }
            for (const item of (receivedInterests || [])) {
                const sId = typeof item.senderProfileId === "object" ? item.senderProfileId?._id : item.senderProfileId
                if (sId) {
                    if (item.status === "accepted") {
                        intMap[String(sId)] = "accepted"
                    } else if (item.status === "pending" && !intMap[String(sId)]) {
                        intMap[String(sId)] = "received_pending"
                    }
                }
            }
            setInterestStatuses(intMap)
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
            setInterestStatuses((prev) => ({ ...prev, [String(profileId)]: "pending" }))
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

    // Dynamic filtering pipeline
    const filteredMatches = useMemo(() => {
        let list = [...matches]

        // 1. Sidebar tab filter
        if (activeSidebar === "Short Listed By You") {
            list = list.filter((m) => shortlistedIds.has(m.id))
            if (list.length === 0 && shortlistedProfilesList.length > 0) {
                list = shortlistedProfilesList
            }
        } else if (activeSidebar === "Viewed you") {
            list = whoViewedYouList
        } else if (activeSidebar === "Newly Joined") {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            list = list.filter((m) => !m.createdAt || m.createdAt >= thirtyDaysAgo)
        } else if (activeSidebar === "Nearby Matches") {
            const myCity = (myProfile?.location?.city || "").toLowerCase().trim()
            const myState = (myProfile?.location?.state || "").toLowerCase().trim()
            if (myCity || myState) {
                list = list.filter((m) => {
                    const loc = (m.location || "").toLowerCase()
                    const st = (m.state || "").toLowerCase()
                    return (myCity && loc.includes(myCity)) || (myState && (loc.includes(myState) || st.includes(myState)))
                })
            }
        }

        // 2. Quick filter chips
        if (activeFilter === "Profiles with photo") {
            list = list.filter((m) => m.hasPhoto)
        } else if (activeFilter === "Newly Joined") {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            list = list.filter((m) => !m.createdAt || m.createdAt >= thirtyDaysAgo)
        } else if (activeFilter === "Same City") {
            const myCity = (myProfile?.location?.city || "").toLowerCase().trim()
            if (myCity) {
                list = list.filter((m) => (m.location || "").toLowerCase().includes(myCity))
            }
        } else if (activeFilter === "Verified") {
            list = list.filter((m) => m.isVerified)
        }

        // 3. Live search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim()
            list = list.filter((m) => {
                return (
                    m.name.toLowerCase().includes(q) ||
                    m.location.toLowerCase().includes(q) ||
                    m.occupation.toLowerCase().includes(q) ||
                    m.education.toLowerCase().includes(q) ||
                    m.tags.some((t) => t.toLowerCase().includes(q))
                )
            })
        }

        return list
    }, [
        matches,
        activeSidebar,
        activeFilter,
        searchQuery,
        shortlistedIds,
        shortlistedProfilesList,
        whoViewedYouList,
        myProfile,
    ])

    const PAGE_SIZE = 4
    const loadMoreMatches = () => {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredMatches.length))
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
                            {sidebarLinks.map((l) => (
                                <SidebarRow
                                    key={l.label}
                                    {...l}
                                    active={activeSidebar === l.label}
                                    onClick={() => {
                                        setActiveSidebar(l.label)
                                        setVisibleCount(6)
                                    }}
                                />
                            ))}
                        </div>
                    </aside>

                    {/* Main Match List */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#640515]">
                                    {activeSidebar}
                                </h1>
                                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                                    {filteredMatches.length} {filteredMatches.length === 1 ? "profile" : "profiles"} found
                                </p>
                            </div>

                            {/* Search bar */}
                            <div className="relative max-w-xs w-full">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by city, name, job..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-[#842029]"
                                />
                            </div>
                        </div>

                        {/* Quick filter chips */}
                        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
                            {["All Matches", "Profiles with photo", "Newly Joined", "Same City", "Verified"].map(
                                (chip) => (
                                    <button
                                        key={chip}
                                        type="button"
                                        onClick={() => {
                                            setActiveFilter(chip)
                                            setVisibleCount(6)
                                        }}
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
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
                        ) : filteredMatches.length === 0 ? (
                            <div className="mt-8 bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                                <p className="text-gray-500 text-sm">
                                    No matches found for your current filter or search criteria. Try selecting "All Matches" or adjusting your partner preferences.
                                </p>
                                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                                    <button
                                        onClick={() => {
                                            setActiveSidebar("Your Matches")
                                            setActiveFilter("All Matches")
                                            setSearchQuery("")
                                        }}
                                        className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                                    >
                                        Reset Filters
                                    </button>
                                    <button
                                        onClick={() => navigate("/profile")}
                                        className="px-6 py-2 rounded-full bg-[#842029] text-white text-xs font-semibold hover:bg-[#6b1b27] cursor-pointer"
                                    >
                                        Adjust Partner Preferences
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="mt-6 space-y-6">
                                    {filteredMatches.slice(0, visibleCount).map((m) => (
                                        <MatchCard
                                            key={m.id}
                                            {...m}
                                            isShortlisted={shortlistedIds.has(m.id)}
                                            interestStatus={interestStatuses[String(m.id)]}
                                            onToggleShortlist={handleToggleShortlist}
                                            onSendInterest={() => handleSendInterest(m.id)}
                                            onViewProfile={() => navigate(`/match-details/${m.id}`)}
                                            onNavigateChat={() => navigate(`/chat?profileId=${m.id}`)}
                                            onNavigateReceived={() => navigate("/interests-received")}
                                        />
                                    ))}
                                </div>

                                {visibleCount < filteredMatches.length && (
                                    <div className="flex justify-center mt-8 mb-6">
                                        <button
                                            onClick={loadMoreMatches}
                                            className="px-8 py-3 rounded-full border-2 border-[#AE2539] text-[#AE2539] font-semibold text-xs sm:text-sm hover:bg-[#AE2539] hover:text-white transition-all shadow-xs cursor-pointer"
                                        >
                                            Load More Matches ({filteredMatches.length - visibleCount} remaining)
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
