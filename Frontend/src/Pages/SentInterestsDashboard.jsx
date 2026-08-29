import { SlidersHorizontal, ChevronDown, CheckCircle, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import { getSentInterests } from "../api/interestApi"
import { getProfileById } from "../api/matchingApi"

const COLORS = {
  primary: '#852231',
  primaryHover: '#6b1b27',
  bgLight: '#fcfaf7',
  textDark: '#2d1419',
}

const SentInterestCard = ({ interest, profile, onNavigate }) => {
  const photoUrl = profile?.photos?.find(p => p.isPrimary)?.url || profile?.photos?.[0]?.url || null
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
      <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4 bg-gray-100">
        {photoUrl ? (
          <img src={photoUrl} alt={profile?.name || "Profile"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Photo</div>
        )}
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-serif font-bold mb-1">
          {profile?.name || "Unknown"}, {profile?.age || ""}
        </h2>
        <p className="text-sm opacity-70 mb-3">
          {profile?.career?.occupation || "Occupation not specified"} &bull; {profile?.location?.city || "Location not specified"}
        </p>
        {profile?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {profile.tags.map((tag, i) => (
              <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#fff1f2', color: '#e11d48' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="mt-auto">
        <div className="rounded-lg p-2 flex items-center justify-between text-xs mb-3 bg-gray-200">
          <div>
            <span className="block text-[12px] tracking-wider opacity-90 font-semibold mb-0.5">Interest Sent</span>
            <div className="flex items-center gap-1 font-bold">
              {interest.status === 'PENDING' || interest.status === 'pending' ? (
                <><Clock className="w-3.5 h-3.5 text-amber-600" /><span className="text-amber-700">STATUS: PENDING</span></>
              ) : (
                <><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /><span className="text-emerald-700">STATUS: ACCEPTED</span></>
              )}
            </div>
          </div>
          <div className="text-right mb-5 text-[#1B1C1C] font-medium">
            {new Date(interest.createdAt).toLocaleDateString()}
          </div>
        </div>
        {interest.status === 'accepted' ? (
          <button onClick={() => onNavigate(`/chat?userId=${interest.receiverProfileId._id || interest.receiverProfileId}`)}
            className="w-full text-center py-2.5 rounded-xl font-medium text-sm text-white transition-colors"
            style={{ backgroundColor: COLORS.primary }}>
            Send Message
          </button>
        ) : (
          <button onClick={() => onNavigate(`/match-details/${interest.receiverProfileId._id || interest.receiverProfileId}`)}
            className="w-full text-center py-2.5 rounded-xl font-medium text-sm border transition-colors bg-white hover:bg-gray-50"
            style={{ borderColor: COLORS.primary, color: COLORS.primary }}>
            View Profile
          </button>
        )}
      </div>
    </div>
  )
}

export default function SentInterestsDashboard() {
  const navigate = useNavigate()
  const [interests, setInterests] = useState([])
  const [profiles, setProfiles] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSentInterests()
        setInterests(data)
        const profileMap = {}
        for (const interest of data) {
          const receiverId = typeof interest.receiverProfileId === 'object' ? interest.receiverProfileId._id : interest.receiverProfileId
          if (receiverId && !profileMap[receiverId]) {
            try {
              const p = await getProfileById(receiverId)
              profileMap[receiverId] = p
            } catch { /* ignore */ }
          }
        }
        setProfiles(profileMap)
      } catch (err) {
        console.error("Failed to fetch sent interests:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getReceiverId = (interest) => {
    return typeof interest.receiverProfileId === 'object' ? interest.receiverProfileId._id : interest.receiverProfileId
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-6 md:p-12 font-sans" style={{ backgroundColor: COLORS.bgLight, color: COLORS.textDark }}>
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase opacity-60 mb-1">
                Matches / <span style={{ color: COLORS.primary }}>Interests</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight" style={{ color: COLORS.primary }}>
                Your Sent Interests
              </h1>
              <p className="text-sm opacity-70 mt-1">Track the connections you've initiated.</p>
            </div>
          </header>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading sent interests...</div>
          ) : interests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No sent interests yet. Start by browsing matches!</div>
          ) : (
            <main className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {interests.map((interest) => (
                <SentInterestCard
                  key={interest._id}
                  interest={interest}
                  profile={profiles[getReceiverId(interest)]}
                  onNavigate={navigate}
                />
              ))}
            </main>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
