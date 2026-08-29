import { Heart, MessageSquare, Share2, Ban, MapPin, GraduationCap, BriefcaseBusiness, Users, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import ConfirmInterestModal from "../Components/ConfirmInterestModal.jsx"
import Matchyoulike from "../Components/Matchyoulike"
import Footer from "../Components/Footer.jsx"
import ProfileImage from "../assets/female_profile2.jpg"
import Navbar from "../Components/Navbar.jsx"
import { getProfileById } from "../api/matchingApi"
import { sendInterest } from "../api/interestApi"

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
  const [showInterestModal, setShowInterestModal] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    const fetchProfile = async () => {
      try {
        const data = await getProfileById(id)
        setProfile(data)
      } catch (err) {
        console.error("Failed to fetch profile:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [id])

  const handleSendInterest = async () => {
    try {
      await sendInterest(id)
      setShowInterestModal(false)
      alert("Interest sent successfully!")
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send interest"
      alert(msg)
      setShowInterestModal(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#FBF9F9] flex items-center justify-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#FBF9F9] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Profile not found</p>
            <button onClick={() => navigate("/browse-matches")} className="text-[#8b1e2d] font-medium">
              &larr; Back to Matches
            </button>
          </div>
        </div>
      </>
    )
  }

  const name = profile.name || "Profile"
  const age = calculateAge(profile.dateOfBirth)
  const displayName = age ? `${name}, ${age}` : name
  const photoUrl = profile.photos?.find((p) => p.isPrimary)?.url || profile.photos?.[0]?.url || ProfileImage
  const values = [profile.religion, profile.motherTongue, profile.lifestyle?.diet].filter(Boolean)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FBF9F9] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => navigate("/browse-matches")} className="text-[#8b1e2d] font-medium flex items-center gap-1">
              <ArrowLeft size={16} /> All Matches
            </button>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="relative overflow-hidden rounded-2xl shadow-md h-[600px] w-full">
                <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
                <div className="absolute bottom-6 left-6 text-[#7a1727]">
                  <h1 className="text-5xl font-serif font-semibold text-white drop-shadow-lg">
                    {displayName}
                  </h1>
                  <div className="flex items-center gap-2 mt-2 text-white drop-shadow-md">
                    <MapPin size={18} />
                    <span>{profile.location?.city ? `${profile.location.city}, ${profile.location.country || "India"}` : "Location not specified"}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                {(profile.photos?.slice(0, 3) || [photoUrl, photoUrl, photoUrl]).map((p, i) => (
                  <img key={i} src={typeof p === "string" ? p : p.url} alt="" className="w-24 h-24 rounded-xl object-cover border-2 border-white shadow" />
                ))}
              </div>
              {typeof profile.compatibilityScore === "number" && (
                <div className="mt-5 bg-white rounded-xl border p-5 flex justify-between items-center">
                  <div>
                    <p className="uppercase text-xs tracking-widest text-gray-500">Great Compatibility</p>
                    <h3 className="text-3xl font-bold text-[#8b1e2d]">{profile.compatibilityScore}%</h3>
                    <p className="text-gray-500 text-sm">Match Based on your shared interests and values.</p>
                  </div>
                  <button className="w-14 h-14 rounded-full border-4 border-[#8b1e2d] flex items-center justify-center">
                    <Heart className="text-[#8b1e2d]" fill="currentColor" size={24} />
                  </button>
                </div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap gap-3 mb-8">
                <button onClick={() => setShowInterestModal(true)} className="bg-[#b3243a] text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-[#981f31] transition">
                  <Heart size={16} fill="currentColor" /> Express Interest
                </button>
                <button onClick={() => navigate(`/chat?userId=${id}`)} className="bg-[#f8d9dd] text-[#b3243a] px-6 py-3 rounded-full flex items-center gap-2">
                  <MessageSquare size={16} /> Message
                </button>
                <button className="w-11 h-11 bg-white rounded-full border flex items-center justify-center"><Share2 size={18} /></button>
                <button className="w-11 h-11 bg-white rounded-full border flex items-center justify-center"><Ban size={18} /></button>
              </div>

              <section className="mb-8">
                <h2 className="text-4xl font-serif text-[#7a1727] mb-4">About {name.split(" ")[0]}</h2>
                <div className="border-t pt-6 text-gray-700 leading-7 pb-16">
                  {profile.aboutMe || "No description provided."}
                </div>
              </section>

              {values.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-4xl font-serif text-[#7a1727] mb-4">Lifestyle & Values</h2>
                  <div className="border-t pt-6 flex flex-wrap gap-3">
                    {values.map((value) => (
                      <span key={value} className="bg-[#f6dfe1] text-[#7a1727] px-4 py-2 rounded-full text-sm">{value}</span>
                    ))}
                  </div>
                </section>
              )}

              <div className="grid md:grid-cols-2 gap-4 mb-10 pt-8">
                <div className="bg-[#E5E7EB] rounded-xl border p-5">
                  <div className="flex items-center gap-2 mb-3 text-[#7a1727]">
                    <GraduationCap size={20} />
                    <h3 className="font-serif text-xl">Education</h3>
                  </div>
                  <p className="text-gray-700">{profile.education?.highestDegree || "Not specified"}{profile.education?.institution ? `, ${profile.education.institution}` : ""}</p>
                </div>
                <div className="bg-[#E5E7EB] rounded-xl border p-5">
                  <div className="flex items-center gap-2 mb-3 text-[#7a1727]">
                    <BriefcaseBusiness size={20} />
                    <h3 className="font-serif text-xl">Career</h3>
                  </div>
                  <p className="text-gray-700">{profile.career?.occupation || "Not specified"}<br />{profile.career?.companyName || ""}</p>
                </div>
              </div>

              {(profile.family?.fatherOccupation || profile.family?.motherOccupation) && (
                <div className="bg-white border rounded-2xl p-8">
                  <h2 className="text-4xl font-serif text-[#7a1727] mb-6">Family Background</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {profile.family?.fatherOccupation && (
                      <div>
                        <p className="text-xs uppercase text-gray-500 mb-1">Father's Profession</p>
                        <p className="font-medium">{profile.family.fatherOccupation}</p>
                      </div>
                    )}
                    {profile.family?.motherOccupation && (
                      <div>
                        <p className="text-xs uppercase text-gray-500 mb-1">Mother's Profession</p>
                        <p className="font-medium">{profile.family.motherOccupation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Matchyoulike className="mt-12" />
      <Footer />
      <ConfirmInterestModal
        isOpen={showInterestModal}
        profileName={name}
        profileImage={photoUrl}
        onClose={() => setShowInterestModal(false)}
        onConfirm={handleSendInterest}
      />
    </>
  )
}
