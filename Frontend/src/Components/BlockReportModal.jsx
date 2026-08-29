import { useState } from "react"
import { X, Ban, Flag, Check, AlertTriangle } from "lucide-react"
import { blockProfile } from "../api/blockApi"
import { reportProfile } from "../api/reportApi"

const REPORT_REASONS = [
    { value: "fake_profile", label: "Fake or Inaccurate Profile" },
    { value: "inappropriate_messages", label: "Inappropriate / Offensive Messages" },
    { value: "harassment", label: "Harassment or Threatening Behavior" },
    { value: "scam", label: "Scam, Fraud, or Money Request" },
    { value: "other", label: "Other Reasons" },
]

export default function BlockReportModal({ isOpen, targetProfile, onClose, onSuccess }) {
    const [tab, setTab] = useState("block") // "block" or "report"
    const [reason, setReason] = useState("fake_profile")
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [successMsg, setSuccessMsg] = useState("")

    if (!isOpen || !targetProfile) return null

    const profileId = targetProfile._id || targetProfile.id
    const profileName = targetProfile.name || "this member"

    const handleBlock = async () => {
        setLoading(true)
        setError("")
        try {
            await blockProfile(profileId)
            setSuccessMsg(`${profileName} has been blocked. You will no longer see their profile or messages.`)
            setTimeout(() => {
                if (onSuccess) onSuccess("blocked")
                onClose()
            }, 1500)
        } catch (err) {
            setError(err.response?.data?.message || "Failed to block user.")
        } finally {
            setLoading(false)
        }
    }

    const handleReport = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            await reportProfile(profileId, reason, description.trim())
            setSuccessMsg("Thank you for submitting your report. Our trust & safety team will review it immediately.")
            setTimeout(() => {
                if (onSuccess) onSuccess("reported")
                onClose()
            }, 1800)
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit report.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#FFE4E8] overflow-hidden">
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                            {tab === "block" ? <Ban size={18} /> : <Flag size={18} />}
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 font-serif">
                            {tab === "block" ? `Block ${profileName}` : `Report ${profileName}`}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 bg-gray-50">
                    <button
                        type="button"
                        onClick={() => setTab("block")}
                        className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                            tab === "block"
                                ? "bg-white text-red-600 border-b-2 border-red-600"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        <Ban size={14} /> Block Member
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("report")}
                        className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                            tab === "report"
                                ? "bg-white text-red-600 border-b-2 border-red-600"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        <Flag size={14} /> Report Violation
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs flex items-center gap-2 mb-2">
                            <Check size={16} /> {successMsg}
                        </div>
                    )}

                    {!successMsg && tab === "block" && (
                        <div className="space-y-4">
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex gap-3">
                                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    Blocking <strong>{profileName}</strong> will immediately remove them from your match recommendations, hide your contact details, and prevent all future chats or interest requests.
                                </p>
                            </div>
                            <div className="pt-3 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-2.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBlock}
                                    disabled={loading}
                                    className="flex-1 py-2.5 text-xs font-semibold bg-red-600 text-white rounded-full hover:bg-red-700 shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                                >
                                    <Ban size={14} /> {loading ? "Blocking..." : "Confirm Block"}
                                </button>
                            </div>
                        </div>
                    )}

                    {!successMsg && tab === "report" && (
                        <form onSubmit={handleReport} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Reason for report
                                </label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-red-500 outline-none"
                                >
                                    {REPORT_REASONS.map((r) => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Additional details (optional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Please describe what happened..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-red-500 outline-none resize-none"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-2.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2.5 text-xs font-semibold bg-red-600 text-white rounded-full hover:bg-red-700 shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                                >
                                    <Flag size={14} /> {loading ? "Submitting..." : "Submit Report"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
