import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Check } from "lucide-react"
import { createProfile, buildProfilePayload } from "../api/profileApi"
import { updatePartnerPreferences } from "../api/partnerPreferenceApi"
import weddingImage from "../assets/login-image.png"
import Logo from "../assets/logo_1.svg"
import BasicInfo from "../Components/BasicInfo"
import PersonalDetails from "../Components/PersonalDetails"
import Interest from "../Components/Interest"

const STORAGE_KEY_FORM = "merijodi_draft_profile"
const STORAGE_KEY_STEP = "merijodi_draft_step"

const MAROON = "#640515"
const ACCENT = "#AE2539"
const STEP_ACTIVE = "#252525"
const STEP_INACTIVE = "#AFAFAF"
const PAGE_BG = "#FBF9F9"

const initialFormData = {
  day: "",
  month: "",
  year: "",
  birthPlace: "",
  motherTongue: "",
  gender: "",
  email: "",
  password: "",
  about: "",
  height: "",
  location: "",
  education: "",
  occupation: "",
  company: "",
  income: "",
  acceptTerms: false,
  minAge: "",
  maxAge: "",
  religion: "",
  caste: "",
  partnereducation: "",
  partneroccupation: "",
  partnerincome: "",
  city: "",
  hobbies: [],
  additionalPreference: "",
}

const steps = [
  { number: 1, label: "Basic info" },
  { number: 2, label: "Personal Details" },
  { number: 3, label: "Interest" },
]

const parseSafeDob = (dobStr) => {
  if (!dobStr) return { day: "", month: "", year: "" }
  try {
    const d = new Date(dobStr)
    if (isNaN(d.getTime())) return { day: "", month: "", year: "" }
    return {
      year: d.getFullYear().toString(),
      month: d.toLocaleString("default", { month: "long" }),
      day: d.getDate().toString(),
    }
  } catch {
    return { day: "", month: "", year: "" }
  }
}

const AddDetailsManually = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const extractedData = location.state?.initialData || {}
  const [step, setStep] = useState(() => {
    try {
      const savedStep = localStorage.getItem(STORAGE_KEY_STEP)
      const num = Number(savedStep)
      return num >= 1 && num <= 3 ? num : 1
    } catch {
      return 1
    }
  })

  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState(() => {
    let savedData = {}
    try {
      const item = localStorage.getItem(STORAGE_KEY_FORM)
      if (item) savedData = JSON.parse(item)
    } catch (e) {
      console.warn("Could not read draft from localStorage", e)
    }

    const dobParts = parseSafeDob(extractedData.personal_details?.date_of_birth)

    return {
      ...initialFormData,
      ...savedData,
      ...extractedData,
      birthPlace:
        extractedData.personal_details?.place_of_birth ||
        savedData.birthPlace ||
        extractedData.birthPlace ||
        "",
      motherTongue:
        extractedData.personal_details?.mother_tongue ||
        savedData.motherTongue ||
        extractedData.motherTongue ||
        "",
      gender: extractedData.personal_details?.gender
        ? extractedData.personal_details.gender.toLowerCase()
        : savedData.gender || extractedData.gender || "",
      year:
        dobParts.year ||
        savedData.year ||
        extractedData.year ||
        "",
      month:
        dobParts.month ||
        savedData.month ||
        extractedData.month ||
        "",
      day:
        dobParts.day ||
        savedData.day ||
        extractedData.day ||
        "",
      about:
        extractedData.personal_details?.about_me ||
        savedData.about ||
        extractedData.about ||
        "",
      height:
        extractedData.personal_details?.height ||
        savedData.height ||
        extractedData.height ||
        "",
      location:
        extractedData.contact_details?.city ||
        savedData.location ||
        extractedData.location ||
        "",
      education:
        extractedData.personal_details?.highest_education ||
        savedData.education ||
        extractedData.education ||
        "",
      occupation:
        extractedData.personal_details?.organization_name ||
        savedData.occupation ||
        extractedData.occupation ||
        "",
      company:
        savedData.company ||
        extractedData.company ||
        "",
      income:
        extractedData.personal_details?.annual_income ||
        savedData.income ||
        extractedData.income ||
        "",
      city:
        extractedData.contact_details?.city ||
        savedData.city ||
        extractedData.city ||
        "",
      religion:
        extractedData.personal_details?.religion ||
        savedData.religion ||
        extractedData.religion ||
        "",
      caste:
        extractedData.personal_details?.caste ||
        savedData.caste ||
        extractedData.caste ||
        "",
      gotham:
        extractedData.personal_details?.gotra ||
        savedData.gotham ||
        extractedData.gotham ||
        "",
      rashi:
        extractedData.personal_details?.rashi ||
        savedData.rashi ||
        extractedData.rashi ||
        "",
      nakshtra:
        extractedData.personal_details?.nakshatra ||
        savedData.nakshtra ||
        extractedData.nakshtra ||
        "",
      manglik:
        extractedData.personal_details?.manglik ||
        savedData.manglik ||
        extractedData.manglik ||
        "",
      complexion:
        extractedData.personal_details?.complexion ||
        savedData.complexion ||
        extractedData.complexion ||
        "",
      maritalStatus:
        extractedData.personal_details?.marital_status ||
        savedData.maritalStatus ||
        extractedData.maritalStatus ||
        "",
      hobbies:
        Array.isArray(savedData.hobbies)
          ? savedData.hobbies
          : Array.isArray(extractedData.personal_details?.hobbies)
          ? extractedData.personal_details.hobbies
          : Array.isArray(extractedData.hobbies)
          ? extractedData.hobbies
          : [],
      acceptTerms: Boolean(savedData.acceptTerms || extractedData.acceptTerms),
    }
  })

  const [errors, setErrors] = useState({})

  // Auto-save form data to localStorage whenever user types
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(formData))
    } catch (e) {
      console.warn("Failed to persist draft to localStorage", e)
    }
  }, [formData])

  // Auto-save current step to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STEP, String(step))
    } catch (e) {
      console.warn("Failed to persist step to localStorage", e)
    }
  }, [step])

  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, 3))
  }

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const submitForm = async () => {
    if (loading) return
    try {
      setLoading(true)
      const payload = buildProfilePayload(formData)
      await createProfile(payload)

      if (
        formData.minAge ||
        formData.maxAge ||
        formData.religion ||
        formData.caste ||
        formData.partnereducation ||
        formData.city
      ) {
        try {
          await updatePartnerPreferences({
            ageMin: formData.minAge ? Number(formData.minAge) : undefined,
            ageMax: formData.maxAge ? Number(formData.maxAge) : undefined,
            religion: formData.religion || undefined,
            caste: formData.caste || undefined,
            education: formData.partnereducation || undefined,
            occupation: formData.partneroccupation || undefined,
            annualIncome: formData.partnerincome || undefined,
            location: formData.city || undefined,
            hobbiesAndInterests:
              Array.isArray(formData.hobbies) && formData.hobbies.length > 0
                ? formData.hobbies
                : undefined,
          })
        } catch (prefErr) {
          console.warn("Could not save initial preferences:", prefErr.message)
        }
      }

      // Clear draft storage on successful creation
      try {
        localStorage.removeItem(STORAGE_KEY_FORM)
        localStorage.removeItem(STORAGE_KEY_STEP)
      } catch (e) {
        console.warn("Failed to clear localStorage draft", e)
      }

      navigate("/home")
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong."
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: PAGE_BG }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-sans { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 font-sans">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="hidden lg:block sticky top-10">
            <img
              src={weddingImage}
              alt="Wedding"
              className="rounded-3xl w-full object-cover h-[calc(100vh-5rem)] max-h-[850px]"
            />
          </div>
          <div>
            <img src={Logo} alt="MeriJodi logo" className="w-[206px] h-16 object-contain" />
            <h1 className="font-display font-bold text-2xl sm:text-3xl mt-8" style={{ color: MAROON }}>
              Complete Your Profile
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">
              Just a few details to help you find your perfect match.
            </p>
            <div className="w-full mt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                aria-disabled={step === 1}
                className="flex items-center font-medium mb-4 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:underline disabled:hover:no-underline"
                style={{ color: ACCENT }}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </button>
              <div className="flex items-start justify-between w-full max-w-3xl mx-auto px-4 relative">
                {steps.map((s, i) => (
                  <div key={s.number} className="contents">
                    <div className="flex flex-col items-center relative z-10 w-16 sm:w-24 md:w-32">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm transition-colors shrink-0"
                        style={{ backgroundColor: step >= s.number ? STEP_ACTIVE : STEP_INACTIVE }}
                      >
                        {step > s.number ? <Check className="w-3.5 h-3.5" /> : s.number}
                      </div>
                      <span
                        className="mt-4 text-xs sm:text-sm md:text-base text-center leading-snug transition-colors"
                        style={{ color: step >= s.number ? STEP_ACTIVE : STEP_INACTIVE }}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className="flex-1 h-[1px] mt-3 relative z-0 mx-[-20px] transition-colors"
                        style={{ backgroundColor: step > s.number ? STEP_ACTIVE : "#C4C4C4" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div
              className={`mt-10 overflow-x-hidden transition-opacity ${
                loading ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  layout
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                >
                  {step === 1 && (
                    <BasicInfo
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                      nextStep={nextStep}
                    />
                  )}
                  {step === 2 && (
                    <PersonalDetails
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                      nextStep={nextStep}
                      prevStep={prevStep}
                    />
                  )}
                  {step === 3 && (
                    <Interest
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                      prevStep={prevStep}
                      submitForm={submitForm}
                      loading={loading}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            {loading && (
              <div className="mt-6 flex items-center gap-3" style={{ color: ACCENT }}>
                <div
                  className="w-5 h-5 rounded-full border-4 border-t-transparent animate-spin"
                  style={{ borderColor: ACCENT, borderTopColor: "transparent" }}
                />
                <span className="font-medium">Creating Profile...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddDetailsManually
