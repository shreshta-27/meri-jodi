import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import Navbar from "../Components/Navbar"
import EditProfileModal from "../Components/EditProfileModal"
import userImage from "../assets/user.jpg"
import match1 from "../assets/match1.png"
import match2 from "../assets/match2.png"
import match3 from "../assets/match3.png"
import match4 from "../assets/match4.png"
import { getMyProfile } from "../api/profileApi"
import {
  Briefcase, Calendar, CigaretteOff, Heart, MapPin, Phone, Sparkles,
  Utensils, WineOff, Users, GraduationCap, Flame, Target, ArrowRight,
} from "lucide-react"

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null
  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return null
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

const formatDate = (dateOfBirth) => {
  if (!dateOfBirth) return null
  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return null
  return dob.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

const formatHeight = (heightCm) => {
  if (!heightCm) return null
  const totalInches = heightCm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}ft ${inches}in`
}

const formatSiblings = (numBrothers, numSisters) => {
  if (numBrothers == null && numSisters == null) return null
  const parts = []
  if (numBrothers) parts.push(`${numBrothers} Brother${numBrothers > 1 ? "s" : ""}`)
  if (numSisters) parts.push(`${numSisters} Sister${numSisters > 1 ? "s" : ""}`)
  return parts.length ? parts.join(", ") : "No siblings"
}

const formatLocation = (location) => {
  if (!location) return null
  return [location.city, location.country].filter(Boolean).join(", ") || null
}

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-1">
    <span className="text-gray-600">{label}</span>
    {value ? <span className="font-medium">{value}</span> : <span className="text-[#842029] cursor-pointer hover:underline">Add {label}</span>}
  </div>
)

const PreferenceField = ({ label, addLabel, value }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
    {value ? <p className="text-base">{value}</p> : <p className="text-[#842029] cursor-pointer hover:underline">{addLabel}</p>}
  </div>
)

const MyProfile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState("loading")
  const [editingSection, setEditingSection] = useState(null)

  useEffect(() => {
    let cancelled = false
    const fetchProfile = async () => {
      setStatus("loading")
      try {
        const data = await getMyProfile()
        if (cancelled) return
        if (data) { setProfile(data); setStatus("found") }
        else { setStatus("empty") }
      } catch (err) {
        console.error("Failed to load profile:", err)
        if (!cancelled) setStatus("error")
      }
    }
    fetchProfile()
    return () => { cancelled = true }
  }, [])

  const handleEditComplete = async () => {
    try {
      const data = await getMyProfile()
      if (data) setProfile(data)
    } catch (err) {
      console.error("Failed to refetch profile:", err)
    }
    setEditingSection(null)
  }

  const fullName = user?.name || profile?.name || "—"
  const email = user?.email || "—"
  const phone = user?.phone || "—"

  const photoSources = profile?.photos?.length
    ? profile.photos.slice(0, 4).map((p) => p.url)
    : [userImage, userImage, userImage, userImage]
  const heroPhoto = photoSources[0]

  if (status === "loading") {
    return (
      <div>
        <Navbar />
        <div className="pt-16 px-20 text-gray-500">Loading your profile...</div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div>
        <Navbar />
        <div className="pt-16 px-20">
          <p className="text-gray-600">Something went wrong loading your profile. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  if (status === "empty") {
    return (
      <div>
        <Navbar />
        <div className="pt-16 px-20">
          <p className="text-gray-600 mb-3">You haven't completed your profile yet.</p>
          <a href="/add-details" className="text-[#842029] font-medium hover:underline">Complete Your Profile →</a>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="pt-16 px-20">
        <div className="flex gap-12">
          <div className="flex flex-col gap-3 min-w-4/12">
            <div>
              <img src={heroPhoto} alt="" className="w-132 h-96 object-cover object-center rounded-2xl" />
            </div>
            <div className="flex gap-3">
              {photoSources.map((src, i) => (
                <img key={i} src={src} alt="" className="h-28 w-28 rounded-2xl object-cover object-center" />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <h2>MY PROFILE</h2>
                <button onClick={() => setEditingSection("personal")} className="text-[#842029] font-medium hover:underline">edit profile</button>
              </div>
              <h1 className="text-5xl">{fullName}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm">
                  <Calendar size={16} />
                  <span>{calculateAge(profile.dateOfBirth) ?? "—"} years</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-[#E0BEBF]"></div>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin size={16} />
                  <span>{formatLocation(profile.location) || "Add Location"}</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-[#E0BEBF]"></div>
                <div className="flex items-center gap-1 text-sm">
                  <Briefcase size={16} />
                  <span>{profile.career?.occupation || "Add Occupation"}</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-[#E0BEBF]"></div>
                <div className="flex items-center gap-1 text-sm">
                  <Phone size={16} />
                  <span>{phone}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#FFF4F6] border border-[#F1AEB44D] rounded-2xl px-12 py-8 space-y-6">
              <p className="flex gap-3 text-2xl"><Sparkles /> About {fullName !== "—" ? fullName.split(" ")[0] : "You"}</p>
              <p>{profile.aboutMe || "You haven't added an about section yet."}</p>
              <h2>Lifestyle</h2>
              {profile.lifestyle ? (
                <div className="flex gap-3">
                  {profile.lifestyle.diet && (
                    <div className="bg-[#E0BEBF33] rounded-full px-6 py-3 flex items-center gap-3">
                      <Utensils size={11} /><p className="text-sm">{profile.lifestyle.diet}</p>
                    </div>
                  )}
                  {profile.lifestyle.smoking === false && (
                    <div className="bg-[#E0BEBF33] rounded-full px-6 py-3 flex items-center gap-3">
                      <CigaretteOff size={11} /><p className="text-sm">Non-smoker</p>
                    </div>
                  )}
                  {profile.lifestyle.drinking === false && (
                    <div className="bg-[#E0BEBF33] rounded-full px-6 py-3 flex items-center gap-3">
                      <WineOff size={11} /><p className="text-sm">Non-drinker</p>
                    </div>
                  )}
                </div>
              ) : (
                <p onClick={() => setEditingSection("lifestyle")} className="text-[#842029] cursor-pointer hover:underline text-sm">Add Lifestyle Preferences</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="border border-[#E0BEBF] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3"><Heart size={24} className="text-[#842029]" /><h3 className="text-lg font-semibold">Personal Details</h3></div>
                <button onClick={() => setEditingSection("personal")} className="text-[#842029] text-sm font-medium hover:underline">✎ Edit</button>
              </div>
              <div className="space-y-2">
                <DetailRow label="Age" value={calculateAge(profile.dateOfBirth) ? `${calculateAge(profile.dateOfBirth)} years` : null} />
                <DetailRow label="Height" value={formatHeight(profile.heightCm)} />
                <DetailRow label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
                <DetailRow label="Place of Birth" value={profile.placeOfBirth} />
                <DetailRow label="Gender" value={profile.gender} />
                <DetailRow label="Location" value={formatLocation(profile.location)} />
                <DetailRow label="Marital Status" value={profile.maritalStatus} />
                <div className="flex justify-between py-1"><span className="text-gray-600">Email</span><span className="font-medium">{email}</span></div>
              </div>
            </div>

            <div className="border border-[#E0BEBF] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3"><Users size={24} className="text-[#842029]" /><h3 className="text-lg font-semibold">Family Background</h3></div>
                <button onClick={() => setEditingSection("family")} className="text-[#842029] text-sm font-medium hover:underline">✎ Edit</button>
              </div>
              <div className="space-y-2">
                <DetailRow label="Mother Tongue" value={profile.motherTongue} />
                <DetailRow label="Family Type" value={profile.family?.familyType} />
                <DetailRow label="Father's Occupation" value={profile.family?.fatherOccupation} />
                <DetailRow label="Mother's Occupation" value={profile.family?.motherOccupation} />
                <DetailRow label="Family Location" value={null} />
                <DetailRow label="Family Values" value={profile.family?.familyValues} />
                <DetailRow label="Siblings" value={formatSiblings(profile.family?.numBrothers, profile.family?.numSisters)} />
              </div>
            </div>

            <div className="border border-[#E0BEBF] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3"><GraduationCap size={24} className="text-[#842029]" /><h3 className="text-lg font-semibold">Career & Education</h3></div>
                <button onClick={() => setEditingSection("career")} className="text-[#842029] text-sm font-medium hover:underline">✎ Edit</button>
              </div>
              <div className="space-y-2">
                <DetailRow label="Education" value={profile.education?.highestDegree} />
                <DetailRow label="College" value={profile.education?.institution} />
                <DetailRow label="Occupation" value={profile.career?.occupation} />
                <DetailRow label="Company Name" value={profile.career?.companyName} />
                <DetailRow label="Annual Income" value={profile.career?.annualIncome} />
              </div>
            </div>

            <div className="border border-[#E0BEBF] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3"><Flame size={24} className="text-[#842029]" /><h3 className="text-lg font-semibold">Religion Details</h3></div>
                <button onClick={() => setEditingSection("religion")} className="text-[#842029] text-sm font-medium hover:underline">✎ Edit</button>
              </div>
              <div className="space-y-2">
                <DetailRow label="Native Place" value={null} />
                <DetailRow label="Religion" value={profile.religion} />
                <DetailRow label="Caste" value={profile.caste} />
                <DetailRow label="Gotham" value={null} />
                <DetailRow label="Nakshtra" value={null} />
                <DetailRow label="Rashi" value={null} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-2 border-[#E0BEBF] border-dashed rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3"><Target size={28} className="text-[#842029]" /><h2 className="text-2xl font-semibold">Ideal Partner Preferences</h2></div>
            <button className="text-[#842029] font-medium hover:underline flex items-center gap-1">✎ Edit</button>
          </div>
          <div className="grid grid-cols-4 gap-8 mb-8">
            <PreferenceField label="AGE RANGE" addLabel="Add Age Range" value={null} />
            <PreferenceField label="HEIGHT" addLabel="Add Height" value={null} />
            <PreferenceField label="MARITAL STATUS" addLabel="Add Marital Status" value={null} />
            <PreferenceField label="LOCATION" addLabel="Add Location" value={null} />
            <PreferenceField label="RELIGION" addLabel="Add Religion" value={null} />
            <PreferenceField label="HEIGHT" addLabel="Add Height" value={null} />
            <PreferenceField label="CASTE" addLabel="Add Caste" value={null} />
            <PreferenceField label="NATIVE PLACE" addLabel="Add Native Place" value={null} />
            <PreferenceField label="EDUCATION" addLabel="Add Education" value={null} />
            <PreferenceField label="OCCUPATION" addLabel="Add Occupation" value={null} />
            <PreferenceField label="COMPANY NAME" addLabel="Add Company Name" value={null} />
            <PreferenceField label="ANNUAL INCOME" addLabel="Add Annual Income" value={null} />
          </div>
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Hobbies & Interests</h3>
            <p className="text-[#842029] cursor-pointer hover:underline text-sm">Add Hobbies & Interests</p>
          </div>
          <button className="flex items-center gap-2 text-[#842029] font-medium hover:underline">⚠ Describe Partner Preferences</button>
        </div>

        <div className="mt-12 rounded-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">Matches You would Like to View</h2>
            <button className="text-red-600 font-medium hover:underline flex items-center gap-2">View All <ArrowRight size={20} /></button>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[
              { img: match1, name: "Ishani D", role: "Lawyer" },
              { img: match2, name: "Pratiksha bedi", role: "Manager" },
              { img: match3, name: "Ishani Shah", role: "Banker" },
              { img: match4, name: "Isha Patel", role: "Actress" },
            ].map((m) => (
              <div key={m.name} className="shrink-0 w-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-80 bg-gray-200">
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/50 to-transparent py-3 px-4 backdrop-blur-md">
                    <p className="text-xs text-gray-300 uppercase tracking-wide">{m.role}</p>
                    <p className="text-white text-lg font-semibold">{m.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={editingSection !== null}
        section={editingSection}
        profile={profile}
        onClose={() => setEditingSection(null)}
        onSuccess={handleEditComplete}
      />
    </div>
  )
}

export default MyProfile
