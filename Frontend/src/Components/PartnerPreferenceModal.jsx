import { useState, useEffect } from "react"
import { X, Target, Save, Check } from "lucide-react"
import {
    motherTongues,
    religions,
    getCastesForLanguage,
} from "../utils/casteData"

const MARITAL_STATUSES = [
    "never_married",
    "divorced",
    "widowed",
    "separated",
    "annulled",
]

const DIET_OPTIONS = ["Vegetarian", "Non-Vegetarian", "Eggetarian", "Jain", "Vegan"]

export default function PartnerPreferenceModal({ isOpen, preferences, onClose, onSave }) {
    const [formData, setFormData] = useState({
        ageMin: 21,
        ageMax: 35,
        heightMinCm: 150,
        heightMaxCm: 190,
        religion: "",
        caste: "",
        location: "",
        education: "",
        occupation: "",
        annualIncome: "",
        diet: "",
        maritalStatus: [],
        willingToRelocate: false,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (preferences) {
            setFormData({
                ageMin: preferences.ageMin || 21,
                ageMax: preferences.ageMax || 35,
                heightMinCm: preferences.heightMinCm || 150,
                heightMaxCm: preferences.heightMaxCm || 190,
                religion: preferences.religion || "",
                caste: preferences.caste || "",
                location: preferences.location || "",
                education: preferences.education || "",
                occupation: preferences.occupation || "",
                annualIncome: preferences.annualIncome || "",
                diet: preferences.diet || "",
                maritalStatus: Array.isArray(preferences.maritalStatus) ? preferences.maritalStatus : [],
                willingToRelocate: preferences.willingToRelocate || false,
            })
        }
    }, [preferences])

    if (!isOpen) return null

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))
    }

    const handleMaritalToggle = (status) => {
        setFormData((prev) => {
            const current = prev.maritalStatus || []
            if (current.includes(status)) {
                return { ...prev, maritalStatus: current.filter((s) => s !== status) }
            }
            return { ...prev, maritalStatus: [...current, status] }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const payload = {
                ...formData,
                ageMin: Number(formData.ageMin) || undefined,
                ageMax: Number(formData.ageMax) || undefined,
                heightMinCm: Number(formData.heightMinCm) || undefined,
                heightMaxCm: Number(formData.heightMaxCm) || undefined,
            }
            await onSave(payload)
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save partner preferences.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#FFE4E8]">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FFF0F2] flex items-center justify-center text-[#842029]">
                            <Target size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#842029] font-serif">
                                Ideal Partner Preferences
                            </h2>
                            <p className="text-xs text-gray-500">
                                Specify your criteria to get high-compatibility match recommendations
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Age Range */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Age Range: {formData.ageMin} - {formData.ageMax} years
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs text-gray-500">Min Age</span>
                                <input
                                    type="number"
                                    name="ageMin"
                                    min="18"
                                    max="80"
                                    value={formData.ageMin}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#842029] outline-none"
                                />
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Max Age</span>
                                <input
                                    type="number"
                                    name="ageMax"
                                    min="18"
                                    max="80"
                                    value={formData.ageMax}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#842029] outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Height Range */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Height Range (cm): {formData.heightMinCm}cm - {formData.heightMaxCm}cm
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs text-gray-500">Min Height (cm)</span>
                                <input
                                    type="number"
                                    name="heightMinCm"
                                    min="130"
                                    max="220"
                                    value={formData.heightMinCm}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#842029] outline-none"
                                />
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Max Height (cm)</span>
                                <input
                                    type="number"
                                    name="heightMaxCm"
                                    min="130"
                                    max="220"
                                    value={formData.heightMaxCm}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#842029] outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Language, Religion & Caste */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">
                                Mother Tongue / Language
                            </label>
                            <select
                                name="motherTongue"
                                value={formData.motherTongue || ""}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#842029] outline-none"
                            >
                                <option value="">Any Language</option>
                                {motherTongues.map((lang) => (
                                    <option key={lang} value={lang}>
                                        {lang}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">
                                Religion
                            </label>
                            <select
                                name="religion"
                                value={formData.religion}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#842029] outline-none"
                            >
                                <option value="">Any Religion</option>
                                {religions.map((rel) => (
                                    <option key={rel} value={rel}>
                                        {rel}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">
                                Caste / Sub-Caste
                            </label>
                            <select
                                name="caste"
                                value={formData.caste || "No Preference"}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#842029] outline-none"
                            >
                                <option value="No Preference">No Preference (Open)</option>
                                {getCastesForLanguage(formData.motherTongue, false).map((caste) => (
                                    <option key={caste} value={caste}>
                                        {caste}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Preferred Location & Education */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">
                                Preferred Location (City / State)
                            </label>
                            <input
                                type="text"
                                name="location"
                                placeholder="e.g. Mumbai, Delhi, Bengaluru"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#842029] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">
                                Minimum Education
                            </label>
                            <input
                                type="text"
                                name="education"
                                placeholder="e.g. Bachelor's, Master's, B.Tech"
                                value={formData.education}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#842029] outline-none"
                            />
                        </div>
                    </div>

                    {/* Occupation & Annual Income */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">
                                Preferred Occupation
                            </label>
                            <input
                                type="text"
                                name="occupation"
                                placeholder="e.g. Software Engineer, Doctor, CA"
                                value={formData.occupation}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#842029] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">
                                Annual Income Preference
                            </label>
                            <input
                                type="text"
                                name="annualIncome"
                                placeholder="e.g. 10 LPA+, 25 LPA+"
                                value={formData.annualIncome}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#842029] outline-none"
                            />
                        </div>
                    </div>

                    {/* Marital Status Multi-Select */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Acceptable Marital Status
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {MARITAL_STATUSES.map((status) => {
                                const active = formData.maritalStatus.includes(status)
                                const label = status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
                                return (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => handleMaritalToggle(status)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                                            active
                                                ? "bg-[#842029] text-white border-[#842029]"
                                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                        }`}
                                    >
                                        {active && <Check size={12} />}
                                        {label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-2.5 rounded-full bg-[#842029] text-white font-semibold text-sm hover:bg-[#6b1b27] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                        >
                            {loading ? (
                                <>Saving...</>
                            ) : (
                                <>
                                    <Save size={16} /> Save Preferences
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
