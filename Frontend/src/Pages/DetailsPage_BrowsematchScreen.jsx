import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
    Heart,
    MessageSquare,
    Share2,
    Ban,
    MapPin,
    GraduationCap,
    BriefcaseBusiness,
    ArrowLeft,
    Star,
    CheckCircle,
    Copy,
    Check,
} from "lucide-react"
import Navbar from "../Components/Navbar.jsx"
import Footer from "../Components/Footer.jsx"
import ConfirmInterestModal from "../Components/ConfirmInterestModal.jsx"
import BlockReportModal from "../Components/BlockReportModal.jsx"
import ProfileImage from "../assets/female_profile2.jpg"
import { getProfileById } from "../api/matchingApi"
import { sendInterest } from "../api/interestApi"
import { toggleShortlist, getShortlistedProfiles } from "../api/shortlistApi"

const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    const dob = new Date(dateOfBirth)
    if (Number.isNaN(dob.getTime())) return null
    return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

export default function DetailsPage_BrowsematchScreen() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isShortlisted, setIsShortlisted] = useState(false)
    const [showInterestModal, setShowInterestModal] = useState(false)
    const [showBlockReportModal, setShowBlockReportModal] = useState(false)
    const [toastMessage, setToastMessage] = useState("")

    useEffect(() => {
        if (!id) {
            setLoading(false)
            return
        }

        const fetchDetails = async () => {
            try {
                const [pData, shortlists] = await Promise.all([
                    getProfileById(id),
                    getShortlistedProfiles().catch(() => []),
                ])
                setProfile(pData)

                // Check if this profile is already shortlisted
                const isShort = shortlists.some((item) => {
                    const sId = typeof item.shortlistedProfileId === "object"
                        ? item.shortlistedProfileId._id
                        : item.shortlistedProfileId
                    return sId === id
                })
                setIsShortlisted(isShort)
            } catch (err) {
                console.error("Failed to fetch profile details:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchDetails()
    }, [id])

    const showToast = (msg) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(""), 3500)
    }

    const handleSendInterest = async () => {
        try {
            await sendInterest(id)
            setShowInterestModal(false)
            showToast("Interest expressed successfully!")
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to send interest"
            showToast(msg)
            setShowInterestModal(false)
        }
    }

    const handleToggleShortlist = async () => {
        try {
            const res = await toggleShortlist(id)
            const added = res?.action === "added"
            setIsShortlisted(added)
            showToast(added ? "Profile saved to your shortlist!" : "Removed from shortlist.")
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to update shortlist.")
        }
    }

    const handleShare = async () => {
        const shareUrl = window.location.href
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${profile?.name || "Member"} on MeriJodi`,
                    text: `Check out this verified matrimonial profile on MeriJodi`,
                    url: shareUrl,
                })
            } catch {
                /* ignore cancel */
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl)
                showToast("Profile link copied to clipboard!")
            } catch {
                showToast("Share URL: " + shareUrl)
            }
        }
    }

    const handleBlockReportSuccess = (action) => {
        if (action === "blocked") {
            navigate("/browse-matches")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FBF9F9] flex flex-col font-sans">
                <Navbar />
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    Loading profile details...
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#FBF9F9] flex flex-col font-sans">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-6 text-center">
                    <div>
                        <h2 className="text-2xl font-bold font-serif text-gray-800 mb-2">
                            Profile Not Found
                        </h2>
                        <p className="text-gray-500 text-sm mb-4">
                            This profile may have been removed or is no longer accessible.
                        </p>
                        <button
                            onClick={() => navigate("/browse-matches")}
                            className="px-6 py-2.5 rounded-full bg-[#842029] text-white text-xs font-semibold hover:bg-[#6b1b27]"
                        >
                            &larr; Back to Browse Matches
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const name = profile.name || "MeriJodi Member"
    const age = calculateAge(profile.dateOfBirth)
    const displayName = age ? `${name}, ${age}` : name
    const photoUrl =
        profile.photos?.find((p) => p.isPrimary)?.url ||
        profile.photos?.[0]?.url ||
        ProfileImage
    const values = [profile.religion, profile.motherTongue, profile.lifestyle?.diet].filter(Boolean)

    return (
        <div className="min-h-screen bg-[#FBF9F9] flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
                {/* Back Button */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate("/browse-matches")}
                        className="text-xs sm:text-sm font-semibold text-[#842029] hover:underline flex items-center gap-1.5"
                    >
                        <ArrowLeft size={16} /> Back to Matches
                    </button>
                </div>

                {toastMessage && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-medium animate-in fade-in">
                        {toastMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Left Column (5 Cols) - Hero Photo & Compatibility */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="relative aspect-4/5 w-full rounded-3xl overflow-hidden shadow-md bg-gray-100">
                            <img
                                src={photoUrl}
                                alt={name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                                <h1 className="text-3xl sm:text-4xl font-bold font-serif leading-tight">
                                    {displayName}
                                </h1>
                                <p className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-200 mt-1">
                                    <MapPin size={15} className="text-rose-400" />
                                    {profile.location?.city ? `${profile.location.city}, ${profile.location.country || "India"}` : "India"}
                                </p>
                            </div>
                        </div>

                        {/* Extra Photos Thumbnails */}
                        {profile.photos?.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {profile.photos.map((p, i) => (
                                    <img
                                        key={i}
                                        src={typeof p === "string" ? p : p.url}
                                        alt=""
                                        className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-xs"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Compatibility Score Widget */}
                        {typeof profile.compatibilityScore === "number" && (
                            <div className="bg-white rounded-3xl p-5 border border-[#FFE4E8] shadow-xs flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                        Match Score
                                    </span>
                                    <h3 className="text-3xl font-extrabold text-[#842029] font-serif">
                                        {profile.compatibilityScore}%
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Based on mutual lifestyle &amp; partner preferences
                                    </p>
                                </div>
                                <button
                                    onClick={handleToggleShortlist}
                                    title={isShortlisted ? "Shortlisted" : "Add to Shortlist"}
                                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                                        isShortlisted
                                            ? "bg-[#842029] border-[#842029] text-white shadow"
                                            : "border-gray-200 text-gray-400 hover:border-[#842029] hover:text-[#842029]"
                                    }`}
                                >
                                    <Star size={20} fill={isShortlisted ? "currentColor" : "none"} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column (7 Cols) - Actions, Bio & Details */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Top Action Bar */}
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => setShowInterestModal(true)}
                                className="flex-1 min-w-[160px] py-3 px-6 rounded-full bg-[#842029] text-white text-xs sm:text-sm font-semibold hover:bg-[#6b1b27] transition-all flex items-center justify-center gap-2 shadow-xs"
                            >
                                <Heart size={16} fill="currentColor" /> Express Interest
                            </button>
                            <button
                                onClick={() => navigate(`/chat?profileId=${id}`)}
                                className="flex-1 min-w-[140px] py-3 px-6 rounded-full bg-[#FFF0F2] text-[#842029] border border-[#FFE4E8] text-xs sm:text-sm font-semibold hover:bg-[#FFE4E8] transition-all flex items-center justify-center gap-2"
                            >
                                <MessageSquare size={16} /> Send Message
                            </button>
                            <button
                                onClick={handleToggleShortlist}
                                title={isShortlisted ? "Remove from Shortlist" : "Save Profile"}
                                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
                                    isShortlisted
                                        ? "bg-amber-50 text-amber-600 border-amber-300"
                                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                <Star size={18} fill={isShortlisted ? "currentColor" : "none"} />
                            </button>
                            <button
                                onClick={handleShare}
                                title="Share Profile"
                                className="w-11 h-11 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center transition-all"
                            >
                                <Share2 size={18} />
                            </button>
                            <button
                                onClick={() => setShowBlockReportModal(true)}
                                title="Block or Report Member"
                                className="w-11 h-11 rounded-full border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center"
                            >
                                <Ban size={18} />
                            </button>
                        </div>

                        {/* About Section */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#640515]">
                                About {name.split(" ")[0]}
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                {profile.aboutMe || "No detailed description provided by this member."}
                            </p>
                            {values.length > 0 && (
                                <div className="pt-3 flex flex-wrap gap-2">
                                    {values.map((v) => (
                                        <span
                                            key={v}
                                            className="px-3.5 py-1 rounded-full bg-[#FFF0F2] text-[#842029] text-xs font-semibold"
                                        >
                                            {v}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Education & Career Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-2">
                                <div className="flex items-center gap-2 text-[#842029]">
                                    <GraduationCap size={18} />
                                    <h3 className="text-sm font-bold font-serif text-gray-900 uppercase tracking-wider">
                                        Education
                                    </h3>
                                </div>
                                <p className="text-sm font-semibold text-gray-800">
                                    {profile.education?.highestDegree || "Not specified"}
                                </p>
                                {profile.education?.institution && (
                                    <p className="text-xs text-gray-500">{profile.education.institution}</p>
                                )}
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-2">
                                <div className="flex items-center gap-2 text-[#842029]">
                                    <BriefcaseBusiness size={18} />
                                    <h3 className="text-sm font-bold font-serif text-gray-900 uppercase tracking-wider">
                                        Career &amp; Income
                                    </h3>
                                </div>
                                <p className="text-sm font-semibold text-gray-800">
                                    {profile.career?.occupation || "Not specified"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {[profile.career?.companyName, profile.career?.annualIncome].filter(Boolean).join(" • ") || "Details withheld"}
                                </p>
                            </div>
                        </div>

                        {/* Family & Religious Details */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-4">
                            <h2 className="text-lg font-bold font-serif text-[#640515]">
                                Background &amp; Religious Details
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs sm:text-sm">
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <span className="text-gray-500">Religion</span>
                                    <span className="font-semibold text-gray-800">{profile.religion || "—"}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <span className="text-gray-500">Caste</span>
                                    <span className="font-semibold text-gray-800">{profile.caste || "—"}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <span className="text-gray-500">Gotra</span>
                                    <span className="font-semibold text-gray-800">{profile.gotham || "—"}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <span className="text-gray-500">Mother Tongue</span>
                                    <span className="font-semibold text-gray-800">{profile.motherTongue || "—"}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <span className="text-gray-500">Family Type</span>
                                    <span className="font-semibold text-gray-800">{profile.family?.familyType || "—"}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <span className="text-gray-500">Father's Profession</span>
                                    <span className="font-semibold text-gray-800">{profile.family?.fatherOccupation || "—"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Modals */}
            <ConfirmInterestModal
                isOpen={showInterestModal}
                profileName={name}
                profileImage={photoUrl}
                onClose={() => setShowInterestModal(false)}
                onConfirm={handleSendInterest}
            />

            <BlockReportModal
                isOpen={showBlockReportModal}
                targetProfile={profile}
                onClose={() => setShowBlockReportModal(false)}
                onSuccess={handleBlockReportSuccess}
            />
        </div>
    )
}
