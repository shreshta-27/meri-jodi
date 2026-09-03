import { useState, useEffect } from "react"
import { ShieldCheck, AlertTriangle, Users, CheckCircle, XCircle, FileText, Eye, RefreshCw, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import { getAdminVerifications, reviewAdminVerification, getAdminReports, updateAdminReportStatus } from "../api/adminApi"
import { useToast } from "../context/ToastContext"

export default function AdminDashboard() {
    const navigate = useNavigate()
    const { addToast } = useToast?.() || { addToast: () => {} }
    const [activeTab, setActiveTab] = useState("verifications")
    const [verifications, setVerifications] = useState([])
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)

    const fetchAllData = async () => {
        setLoading(true)
        try {
            const [vData, rData] = await Promise.all([
                getAdminVerifications().catch(() => ({ verifications: [], total: 0 })),
                getAdminReports().catch(() => ({ reports: [], total: 0 })),
            ])
            setVerifications(vData.verifications || [])
            setReports(rData.reports || [])
        } catch (err) {
            console.error("Failed to load admin data:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAllData()
    }, [])

    const handleReviewVerification = async (id, status) => {
        setActionLoading(id)
        try {
            await reviewAdminVerification(id, status)
            if (addToast) addToast(`Verification request ${status === "verified" ? "approved" : "rejected"}.`, "success")
            fetchAllData()
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update verification status"
            if (addToast) addToast(msg, "error")
        } finally {
            setActionLoading(null)
        }
    }

    const handleUpdateReport = async (id, status) => {
        setActionLoading(id)
        try {
            await updateAdminReportStatus(id, status)
            if (addToast) addToast(`Report marked as ${status}.`, "success")
            fetchAllData()
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update report status"
            if (addToast) addToast(msg, "error")
        } finally {
            setActionLoading(null)
        }
    }

    const pendingVerificationsCount = verifications.filter((v) => v.status === "submitted" || v.status === "under_review").length
    const pendingReportsCount = reports.filter((r) => r.status === "pending").length

    return (
        <div className="min-h-screen bg-[#FBF9F9] flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-[#842029] text-xs font-bold uppercase tracking-wider">
                                Administration Console
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#640515]">
                            MeriJodi Admin Portal
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Review identity verifications, resolve safety reports, and manage platform compliance.
                        </p>
                    </div>
                    <button
                        onClick={fetchAllData}
                        className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 flex items-center gap-2 shadow-2xs cursor-pointer"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Data
                    </button>
                </div>

                {/* Metrics Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF0F2] text-[#842029] flex items-center justify-center shrink-0">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Pending ID Verifications</p>
                            <h3 className="text-2xl font-bold font-serif text-gray-900">{pendingVerificationsCount}</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Pending Safety Reports</p>
                            <h3 className="text-2xl font-bold font-serif text-gray-900">{pendingReportsCount}</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Total Reviewed Verifications</p>
                            <h3 className="text-2xl font-bold font-serif text-gray-900">
                                {verifications.filter((v) => v.status === "verified").length}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-200 mb-6 gap-2">
                    <button
                        onClick={() => setActiveTab("verifications")}
                        className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === "verifications"
                                ? "border-[#842029] text-[#842029]"
                                : "border-transparent text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        <ShieldCheck size={16} /> ID Verifications ({verifications.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("reports")}
                        className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === "reports"
                                ? "border-[#842029] text-[#842029]"
                                : "border-transparent text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        <AlertTriangle size={16} /> Safety &amp; Abuse Reports ({reports.length})
                    </button>
                </div>

                {/* Tab 1: ID Verifications */}
                {activeTab === "verifications" && (
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs">
                        {loading ? (
                            <div className="p-12 text-center text-xs text-gray-400">Loading verifications...</div>
                        ) : verifications.length === 0 ? (
                            <div className="p-12 text-center text-xs text-gray-400">No verification requests found.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                                            <th className="pb-3 px-2">Member</th>
                                            <th className="pb-3 px-2">Document</th>
                                            <th className="pb-3 px-2">Submitted</th>
                                            <th className="pb-3 px-2">Status</th>
                                            <th className="pb-3 px-2 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {verifications.map((v) => {
                                            const memberName = v.profileId?.name || "MeriJodi Member"
                                            const memberLocation = v.profileId?.location?.city || "India"
                                            const isPending = v.status === "submitted" || v.status === "under_review"

                                            return (
                                                <tr key={v._id} className="hover:bg-rose-50/20 transition-colors">
                                                    <td className="py-3 px-2">
                                                        <div className="font-bold text-gray-900">{memberName}</div>
                                                        <div className="text-[11px] text-gray-400">{memberLocation}</div>
                                                    </td>
                                                    <td className="py-3 px-2 font-medium capitalize">
                                                        <span className="inline-flex items-center gap-1">
                                                            <FileText size={13} className="text-gray-400" />
                                                            {v.documentType?.replace(/_/g, " ") || "Government ID"}
                                                        </span>
                                                        {v.documentUrl && (
                                                            <a
                                                                href={v.documentUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="block text-[11px] text-[#842029] hover:underline mt-0.5"
                                                            >
                                                                View Document ↗
                                                            </a>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-2 text-gray-500 text-xs">
                                                        {new Date(v.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <span
                                                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                                v.status === "verified"
                                                                    ? "bg-emerald-100 text-emerald-800"
                                                                    : v.status === "rejected"
                                                                    ? "bg-red-100 text-red-800"
                                                                    : "bg-amber-100 text-amber-800"
                                                            }`}
                                                        >
                                                            {v.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2 text-right">
                                                        {isPending ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    disabled={actionLoading === v._id}
                                                                    onClick={() => handleReviewVerification(v._id, "verified")}
                                                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                                                >
                                                                    <CheckCircle size={13} /> Approve
                                                                </button>
                                                                <button
                                                                    disabled={actionLoading === v._id}
                                                                    onClick={() => handleReviewVerification(v._id, "rejected")}
                                                                    className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                                                >
                                                                    <XCircle size={13} /> Reject
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs italic">Reviewed</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: Safety & Abuse Reports */}
                {activeTab === "reports" && (
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs">
                        {loading ? (
                            <div className="p-12 text-center text-xs text-gray-400">Loading reports...</div>
                        ) : reports.length === 0 ? (
                            <div className="p-12 text-center text-xs text-gray-400">No abuse or safety reports found.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                                            <th className="pb-3 px-2">Reported Member</th>
                                            <th className="pb-3 px-2">Reason</th>
                                            <th className="pb-3 px-2">Reported On</th>
                                            <th className="pb-3 px-2">Status</th>
                                            <th className="pb-3 px-2 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {reports.map((r) => {
                                            const reportedName = r.reportedProfileId?.name || "Reported Member"
                                            const isPending = r.status === "pending"

                                            return (
                                                <tr key={r._id} className="hover:bg-rose-50/20 transition-colors">
                                                    <td className="py-3 px-2">
                                                        <div className="font-bold text-gray-900">{reportedName}</div>
                                                        <div className="text-[11px] text-gray-400">{r.description || "No description provided"}</div>
                                                    </td>
                                                    <td className="py-3 px-2 font-medium capitalize">
                                                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs border border-amber-200">
                                                            {r.reason?.replace(/_/g, " ") || "Inappropriate Content"}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2 text-gray-500 text-xs">
                                                        {new Date(r.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <span
                                                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                                r.status === "resolved"
                                                                    ? "bg-emerald-100 text-emerald-800"
                                                                    : r.status === "dismissed"
                                                                    ? "bg-gray-100 text-gray-800"
                                                                    : "bg-amber-100 text-amber-800"
                                                            }`}
                                                        >
                                                            {r.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2 text-right">
                                                        {isPending ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    disabled={actionLoading === r._id}
                                                                    onClick={() => handleUpdateReport(r._id, "resolved")}
                                                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                                                >
                                                                    <CheckCircle size={13} /> Resolve
                                                                </button>
                                                                <button
                                                                    disabled={actionLoading === r._id}
                                                                    onClick={() => handleUpdateReport(r._id, "dismissed")}
                                                                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                                                >
                                                                    Dismiss
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs italic">Completed</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}
