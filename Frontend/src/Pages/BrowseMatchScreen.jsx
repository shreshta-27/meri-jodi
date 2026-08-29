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
  X,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import home1 from "../assets/home1.png"
import { getMyMatches } from "../api/matchingApi"
import { sendInterest } from "../api/interestApi"

const COLORS = {
  pageBg: "#FBF9F9",
  cardBg: "#FFFFFF",
  maroon: "#640515",
  accentRed: "#AE2539",
  badgeCoral: "#ED5463",
  pillBg: "#FFDAD9",
  softPink: "#FFF4F6",
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
  name: profile.name || "MeriJodi Member",
  age: calculateAge(profile.dateOfBirth),
  match: profile.compatibilityScore,
  location: profile.location?.city || "Location not specified",
  education: profile.education?.highestDegree || "",
  occupation: profile.career?.occupation || "",
  tags: [],
  quote: profile.aboutMe ? `"${profile.aboutMe.slice(0, 150)}..."` : "",
  image:
    profile.photos?.find((p) => p.isPrimary)?.url ||
    profile.photos?.[0]?.url ||
    home1,
})

const MatchCard = ({
  image, name, age, match, location, education, occupation, tags, quote,
  onSendInterest, onViewProfile,
}) => (
  <div
    className="relative bg-white rounded-2xl border p-3 sm:p-4 flex flex-col sm:flex-row gap-4"
    style={{ borderColor: COLORS.borderGray }}
  >
    <div className="relative w-full sm:w-40 md:w-44 h-56 sm:h-auto self-stretch shrink-0 rounded-xl overflow-hidden">
      <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      {typeof match === "number" && (
        <span
          className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: COLORS.badgeCoral }}
        >
          <Star className="w-3 h-3" fill="#fff" color="#fff" />
          {match}% Match
        </span>
      )}
    </div>
    <div className="flex-1 min-w-0 pr-6">
      <h3 className="font-display font-bold text-lg sm:text-xl" style={{ color: COLORS.maroon }}>
        {name}{typeof age === "number" ? `, ${age}` : ""}
      </h3>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm" style={{ color: COLORS.bodyGray }}>
        {location && <span>{location}</span>}
        {education && <span>{education}</span>}
        {occupation && <span>{occupation}</span>}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag) => (
            <span
              key={tag.label}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ backgroundColor: COLORS.pillBg, color: COLORS.maroon }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}
      {quote && (
        <div
          className="rounded-xl px-3.5 py-3 mt-3 text-sm italic leading-relaxed line-clamp-2"
          style={{ backgroundColor: COLORS.activeBg, color: "#4B4B4B" }}
        >
          {quote}
        </div>
      )}
      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={onSendInterest}
          className="flex-1 rounded-full py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: COLORS.accentRed }}
        >
          Send Interest
        </button>
        <button
          type="button"
          onClick={onViewProfile}
          className="flex-1 rounded-full py-2.5 text-sm font-semibold border text-[#AE2539] hover:bg-[#AE2539] hover:text-white transition-colors"
          style={{ borderColor: COLORS.accentRed }}
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
    className="w-full flex items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#FCEFF0]"
    style={active ? { backgroundColor: COLORS.activeBg } : undefined}
  >
    <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: COLORS.maroon }} />
    <span className="flex-1 min-w-0">
      <span className="block text-sm font-semibold" style={{ color: active ? COLORS.maroon : "#2B2B2B" }}>
        {label}
      </span>
      <span className="block text-xs mt-0.5 leading-snug" style={{ color: COLORS.bodyGray }}>
        {subtitle}
      </span>
    </span>
    {active && <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" style={{ color: COLORS.maroon }} />}
  </button>
)

const SidebarSectionLabel = ({ children }) => (
  <p className="px-3 mt-5 mb-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: COLORS.bodyGray }}>
    {children}
  </p>
)

const sidebarLinks = [
  { label: "Your Matches", subtitle: "View all profiles that match your preferences", icon: Heart },
  { label: "Short Listed By You", subtitle: "Matches you have shortlisted", icon: Star },
  { label: "Viewed you", subtitle: "Matches who have viewed your profile", icon: Eye },
  { label: "Newly Joined", subtitle: "Matches who joined within the last 30 days", icon: Sparkles },
  { label: "Nearby Matches", subtitle: "Matches near your location", icon: MapPinned },
]

export default function BrowseMatchScreen() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(3)
  const scrollRef = useRef(null)

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const result = await getMyMatches()
        setMatches((result?.matches ?? []).map(mapProfileToCard))
      } catch (err) {
        console.error("Failed to fetch matches:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchMatches()
  }, [])

  const handleSendInterest = async (profileId) => {
    try {
      await sendInterest(profileId)
      alert("Interest sent successfully!")
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send interest"
      alert(msg)
    }
  }

  const PAGE_SIZE = 3
  const loadMoreMatches = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, matches.length))
  }

  return (
    <div style={{ backgroundColor: COLORS.pageBg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-sans { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
      `}</style>
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-white p-3 border" style={{ borderColor: COLORS.borderGray }}>
              <p className="px-3 pt-2 pb-3 font-display font-bold text-base" style={{ color: COLORS.maroon }}>
                All Matches
              </p>
              {sidebarLinks.map((l, i) => (
                <div key={l.label}>
                  {i === 1 && <SidebarSectionLabel>Based on activity</SidebarSectionLabel>}
                  {i === 3 && <SidebarSectionLabel>Recently Joined &amp; Nearby Matches</SidebarSectionLabel>}
                  <SidebarRow {...l} active={i === 0} onClick={() => {
                    if (l.label === "Your Matches") navigate("/browse-matches")
                    if (l.label === "Short Listed By You") navigate("/shortlist")
                    if (l.label === "Viewed you") navigate("/profile")
                    if (l.label === "Nearby Matches") navigate("/browse-matches")
                  }} />
                </div>
              ))}
            </div>
          </aside>
          <main className="flex-1 min-w-0">
            <h1
              className="font-display font-bold text-3xl sm:text-4xl lg:text-[45px] leading-tight lg:leading-none"
              style={{ color: COLORS.maroon }}
            >
              Recommended Matches for You
            </h1>
            <p className="mt-3 text-base" style={{ color: COLORS.bodyGray }}>
              Discover high-compatibility profiles based on your preferences.
            </p>
            <div className="mt-6 flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="flex items-center gap-2 shrink-0 rounded-full border px-4 py-2 text-sm font-medium"
                style={{ borderColor: COLORS.borderGray, color: "#2B2B2B" }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 shrink-0 rounded-full border px-4 py-2 text-sm font-medium"
                style={{ borderColor: COLORS.borderGray, color: "#2B2B2B" }}
              >
                Sort by
                <ChevronDown className="w-4 h-4" />
              </button>
              <div
                ref={scrollRef}
                className="flex items-center gap-2 overflow-x-auto scroll-smooth min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {["Newly Joined", "Not seen", "Profiles with photo", "Mutual Matches", "Location"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap"
                    style={{ borderColor: COLORS.borderGray, color: "#2B2B2B" }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="mt-10 text-center" style={{ color: COLORS.bodyGray }}>Loading matches...</div>
            ) : (
              <>
                <div className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">
                  {matches.slice(0, visibleCount).map((m) => (
                    <MatchCard
                      key={m.id}
                      {...m}
                      onSendInterest={() => handleSendInterest(m.id)}
                      onViewProfile={() => navigate(`/match-details/${m.id}`)}
                    />
                  ))}
                </div>
                {visibleCount < matches.length && (
                  <div className="flex justify-center mt-8 sm:mt-10 mb-6">
                    <button
                      onClick={loadMoreMatches}
                      className="px-8 py-3 rounded-full border-2 border-[#AE2539] text-[#AE2539] font-semibold text-base sm:text-lg hover:bg-[#AE2539] hover:text-white transition-all duration-300"
                    >
                      Load More Matches
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}
