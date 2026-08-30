import { Camera, Heart, Users, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import home1 from "../assets/home1.png"
import home4 from "../assets/home4.png"
import { useAuth } from "../context/AuthContext"
import { getMyProfile, getRecommendedMatches, getWhoViewedYou } from "../api/dashboardApi"

const COLORS = {
  pageBg: "#FBF9F9",
  maroon: "#640515",
  accentRed: "#B2283C",
  bannerBg: "#FFF4F6",
  pillBg: "#FFDAD9",
  trackBg: "#F7DDDF",
  trackFill: "#252525",
  successBg: "#EFEDED",
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
  role: profile.career?.occupation || "Occupation not specified",
  location: profile.location?.city || "Location not specified",
  tags: [],
  image:
    profile.photos?.find((p) => p.isPrimary)?.url ||
    profile.photos?.[0]?.url ||
    home1,
})

const MatchCard = ({ image, name, age, match, role, location, tags = [], onClick }) => (
  <div
    className="bg-white w-full rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer"
    onClick={onClick}
  >
    <div className="relative aspect-[4/3] w-full overflow-hidden">
      <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      {typeof match === "number" && (
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold shadow-sm" style={{ color: "#2b2b2b" }}>
          <Star className="w-3 h-3" fill={COLORS.maroon} color={COLORS.maroon} />
          {match}% Match
        </span>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-display font-bold text-lg sm:text-xl md:text-2xl leading-tight" style={{ color: COLORS.maroon }}>
        {name}{age ? `, ${age}` : ""}
      </h3>
      <p className="text-sm mt-1" style={{ color: COLORS.bodyGray }}>
        {role} &bull; {location}
      </p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag) => (
            <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: COLORS.pillBg, color: COLORS.maroon }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
)

const SectionHeading = ({ children, action }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
    <h2 className="font-display font-bold text-lg sm:text-xl md:text-2xl" style={{ color: COLORS.maroon }}>
      {children}
    </h2>
    {action}
  </div>
)

const EmptyState = ({ children }) => (
  <p className="text-sm rounded-2xl border border-dashed p-6 text-center" style={{ color: COLORS.bodyGray, borderColor: COLORS.trackBg }}>
    {children}
  </p>
)

const HomePage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [status, setStatus] = useState("loading")
  const [profile, setProfile] = useState(null)
  const [matches, setMatches] = useState([])
  const [whoViewedYou, setWhoViewedYou] = useState([])

  useEffect(() => {
    let cancelled = false
    const fetchDashboard = async () => {
      setStatus("loading")
      try {
        const [profileData, matchData, viewedData] = await Promise.all([
          getMyProfile(),
          getRecommendedMatches(3),
          getWhoViewedYou(),
        ])
        if (cancelled) return
        if (!profileData) { setStatus("empty"); return }
        setProfile(profileData)
        setMatches((matchData || []).map(mapProfileToCard))
        setWhoViewedYou((viewedData || []).map((v) => mapProfileToCard(v.profile || v)))
        setStatus("ready")
      } catch (err) {
        console.error("Failed to load dashboard:", err)
        if (!cancelled) setStatus("error")
      }
    }
    fetchDashboard()
    return () => { cancelled = true }
  }, [])

  const userName = user?.name

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.pageBg }}>
        <p style={{ color: COLORS.bodyGray }}>Loading your dashboard...</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen" style={{ backgroundColor: COLORS.pageBg }}>
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <p style={{ color: COLORS.bodyGray }}>Something went wrong loading your dashboard. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  if (status === "empty") {
    return (
      <div className="min-h-screen" style={{ backgroundColor: COLORS.pageBg }}>
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <p className="mb-3" style={{ color: COLORS.bodyGray }}>
            You haven't completed your profile yet.
          </p>
          <a href="/add-details" className="font-semibold hover:underline" style={{ color: COLORS.accentRed }}>
            Complete Your Profile &rarr;
          </a>
        </div>
      </div>
    )
  }

  const profileCompletion = profile?.profileCompletionPct ?? 0

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: COLORS.pageBg }}>
      <Navbar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-sans { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
      `}</style>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-8 sm:py-10 md:py-14">
        <header>
          <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl" style={{ color: COLORS.maroon }}>
            Welcome back{userName ? `, ${userName}` : ""}
          </h1>
          <p className="mt-2" style={{ color: COLORS.bodyGray }}>
            Your journey to a lifetime of love continues here.
          </p>
        </header>

        <div className="mt-6 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-5 border border-[#f2858e] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow" style={{ backgroundColor: COLORS.bannerBg }}>
          <div>
            <p className="font-semibold text-lg sm:text-xl" style={{ color: COLORS.maroon }}>Profile Completion</p>
            <div className="flex flex-wrap items-center gap-3 mt-2.5 text-sm" style={{ color: COLORS.bodyGray }}>
              Profile completeness score:
              <span style={{ color: COLORS.maroon }}>{profileCompletion}%</span>
              <div className="w-32 h-[6px] rounded-full overflow-hidden" style={{ backgroundColor: COLORS.trackBg }}>
                <div className="h-full rounded-full" style={{ width: `${profileCompletion}%`, backgroundColor: COLORS.maroon }} />
              </div>
            </div>
          </div>
          <div className="hidden md:block relative h-20 rounded p-2">
            <span className="absolute top-4 h-12 border-l border-red-400" />
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6">
            {[
              { label: "Add Photo", icon: Camera },
              { label: "Add Hobbies", icon: Heart },
              { label: "Add Family Details", icon: Users },
            ].map(({ label, icon: Icon }) => (
              <button key={label} type="button" onClick={() => navigate("/profile")} className="flex items-center gap-3 bg-white rounded-full pl-2 pr-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-shadow" style={{ color: "#2b2b2b" }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: COLORS.pillBg, color: COLORS.maroon }}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>

        <section className="mt-10">
          <SectionHeading action={<a href="/browse-matches" className="text-sm font-semibold hover:underline" style={{ color: COLORS.accentRed }}>View All Matches</a>}>
            Matches for You
          </SectionHeading>
          {matches.length === 0 ? (
            <EmptyState>No matches yet &mdash; check back soon as more members join.</EmptyState>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {matches.map((m) => (
                <MatchCard key={m.id} {...m} onClick={() => navigate(`/match-details/${m.id}`)} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 rounded-2xl overflow-hidden grid md:grid-cols-2" style={{ backgroundColor: COLORS.successBg }}>
          <div className="p-6 sm:p-7 md:p-9 flex flex-col justify-center">
            <span className="text-sm font-bold tracking-[0.12em]" style={{ color: COLORS.accentRed }}>SUCCESS STORIES</span>
            <p className="font-display font-bold text-2xl sm:text-3xl md:text-4xl leading-snug mt-3" style={{ color: COLORS.maroon }}>
              &ldquo;We found our forever on EternalUnion.&rdquo;
            </p>
            <p className="text-sm leading-relaxed mt-3" style={{ color: COLORS.bodyGray }}>
              Priya and Sameer met through our curated recommendations in late 2022. Today, they are happily married and building a life of shared dreams.
            </p>
            <a href="#" className="text-sm font-semibold mt-4 hover:underline" style={{ color: COLORS.accentRed }}>Read more stories</a>
          </div>
          <img src={home4} alt="Married couple success story" className="w-full h-56 sm:h-64 md:h-full object-cover" />
        </section>

        <section className="mt-10">
          <SectionHeading>Who Viewed You ({whoViewedYou.length})</SectionHeading>
          {whoViewedYou.length === 0 ? (
            <EmptyState>No one has viewed your profile yet.</EmptyState>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {whoViewedYou.map((m) => (
                <MatchCard key={m.id} {...m} onClick={() => navigate(`/match-details/${m.id}`)} />
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  )
}

export default HomePage
