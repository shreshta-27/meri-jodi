import { ChevronDown, SlidersHorizontal, X, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import { getReceivedInterests, acceptInterest, declineInterest } from "../api/interestApi"
import { getProfileById } from "../api/matchingApi"

const COLORS = {
  primary: '#852231',
  bgLight: '#fcfaf7',
  textDark: '#2d1419',
}

const ReceivedInterestCard = ({ interest, profile, onAccept, onDecline, onViewProfile }) => {
  const photoUrl = profile?.photos?.find(p => p.isPrimary)?.url || profile?.photos?.[0]?.url || null
  return (
    <div className="bg-white w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col sm:flex-row relative">
      <button onClick={onDecline} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 transition-colors z-10">
        <X className="w-5 h-5" />
      </button>
      <div className="w-full sm:w-48 md:w-56 h-64 sm:h-auto relative shrink-0">
        {photoUrl ? (
          <img src={photoUrl} alt={profile?.name || "Profile"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">No Photo</div>
        )}
      </div>
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <h2 className="text-2xl font-serif font-bold text-gray-900">
              {profile?.name || "Unknown"}, {profile?.age || ""}
            </h2>
          </div>
          <p className="text-xs font-bold tracking-wider opacity-60 mb-4">
            {profile?.career?.occupation || "Occupation not specified"} &bull; {profile?.location?.city || "Location not specified"}
          </p>
          {profile?.aboutMe && (
            <div className="bg-[#F5F3F3] border border-gray-100 rounded-xl p-4 mb-6">
              <p className="text-base italic text-gray-600 leading-relaxed font-normal">
                &ldquo;{profile.aboutMe.slice(0, 200)}&rdquo;
              </p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button onClick={onAccept}
            className="text-center py-2.5 rounded-xl font-medium text-xs text-white transition-colors"
            style={{ backgroundColor: COLORS.primary }}>
            Accept Interest
          </button>
          <button onClick={onViewProfile}
            className="text-center py-2.5 rounded-xl font-medium text-xs border transition-colors bg-white hover:bg-gray-50"
            style={{ borderColor: COLORS.primary, color: COLORS.primary }}>
            View Profile
          </button>
        </div>
      </div>
    </div>
  )
}

export default function InterestsReceivedDashboard() {
  const navigate = useNavigate()
  const [interests, setInterests] = useState([])
  const [profiles, setProfiles] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const data = await getReceivedInterests()
      setInterests(data)
      const profileMap = {}
      for (const interest of data) {
        const senderId = typeof interest.senderProfileId === 'object' ? interest.senderProfileId._id : interest.senderProfileId
        if (senderId && !profileMap[senderId]) {
          try {
            const p = await getProfileById(senderId)
            profileMap[senderId] = p
          } catch { /* ignore */ }
        }
      }
      setProfiles(profileMap)
    } catch (err) {
      console.error("Failed to fetch received interests:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const getSenderId = (interest) => {
    return typeof interest.senderProfileId === 'object' ? interest.senderProfileId._id : interest.senderProfileId
  }

  const handleAccept = async (interestId) => {
    try {
      await acceptInterest(interestId)
      await fetchData()
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept interest")
    }
  }

  const handleDecline = async (interestId) => {
    try {
      await declineInterest(interestId)
      await fetchData()
    } catch (err) {
      alert(err.response?.data?.message || "Failed to decline interest")
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-6 md:p-12 font-sans antialiased" style={{ backgroundColor: COLORS.bgLight, color: COLORS.textDark }}>
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase opacity-60 mb-1">
                Matches / <span style={{ color: COLORS.primary }}>Interests</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight" style={{ color: COLORS.primary }}>
                Interests Received
              </h1>
              <p className="text-sm opacity-70 mt-1">Review interest requests from other members.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-medium">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-md shadow-sm hover:bg-gray-50 transition-colors">
                Sort by: <span className="font-semibold">Recent</span>
                <ChevronDown className="w-4 h-4 opacity-60" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-white rounded-md shadow-sm transition-colors" style={{ backgroundColor: COLORS.primary }}>
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>
          </header>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading received interests...</div>
          ) : interests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No received interests yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {interests.map((interest) => (
                <ReceivedInterestCard
                  key={interest._id}
                  interest={interest}
                  profile={profiles[getSenderId(interest)]}
                  onAccept={() => handleAccept(interest._id)}
                  onDecline={() => handleDecline(interest._id)}
                  onViewProfile={() => navigate(`/match-details/${getSenderId(interest)}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
