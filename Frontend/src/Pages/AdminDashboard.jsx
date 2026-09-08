import { useState, useEffect, useCallback } from "react"
import {
    ShieldCheck,
    AlertTriangle,
    Users,
    CheckCircle,
    XCircle,
    FileText,
    Eye,
    RefreshCw,
    Search,
    Filter,
    UserCheck,
    UserX,
    Trash2,
    Activity,
    Heart,
    MessageCircle,
    X,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Award,
    MapPin,
    Briefcase,
    GraduationCap,
    Calendar,
    Clock,
    Sparkles,
    Check,
    Lock,
    Unlock,
    ShieldAlert,
    Image as ImageIcon,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import {
    getAdminStats,
    getAdminUsers,
    getAdminUserById,
    updateAdminUserStatus,
    updateAdminUserRole,
    toggleAdminUserVerification,
    deleteAdminUser,
    getAdminVerifications,
    reviewAdminVerification,
    getAdminReports,
    updateAdminReportStatus,
} from "../api/adminApi"
import { useToast } from "../context/ToastContext"
import ConfirmModal from "../Components/ConfirmModal"

export default function AdminDashboard() {
    const navigate = useNavigate()
    const { addToast } = useToast?.() || { addToast: () => {} }

    // Navigation & Tabs
    const [activeTab, setActiveTab] = useState("overview") // 'overview' | 'verifications' | 'reports' | 'users'
    const [deleteConfirm, setDeleteConfirm] = useState(null) // { userId, userName }
    const [roleConfirm, setRoleConfirm] = useState(null) // { userId, userName, nextRole }

    // Data States
    const [stats, setStats] = useState(null)
    const [verifications, setVerifications] = useState([])
    const [reports, setReports] = useState([])
    const [users, setUsers] = useState([])
    const [userPagination, setUserPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)

    // Filters & Search
    const [verificationFilter, setVerificationFilter] = useState("all")
    const [reportFilter, setReportFilter] = useState("all")
    const [userSearch, setUserSearch] = useState("")
    const [userStatusFilter, setUserStatusFilter] = useState("all")
    const [userRoleFilter, setUserRoleFilter] = useState("all")
    const [userGenderFilter, setUserGenderFilter] = useState("all")
    const [userVerifiedFilter, setUserVerifiedFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)

    // Modals
    const [selectedVerification, setSelectedVerification] = useState(null)
    const [verificationNote, setVerificationNote] = useState("")
    const [selectedReport, setSelectedReport] = useState(null)
    const [reportActionNote, setReportActionNote] = useState("")
    const [selectedUserDetail, setSelectedUserDetail] = useState(null)
    const [loadingUserDetail, setLoadingUserDetail] = useState(false)

    // Fetch All Primary Data
    const fetchAllData = useCallback(async () => {
        setLoading(true)
        try {
            const [statsRes, vRes, rRes, uRes] = await Promise.all([
                getAdminStats().catch(() => null),
                getAdminVerifications({ limit: 100 }).catch(() => ({ verifications: [] })),
                getAdminReports({ limit: 100 }).catch(() => ({ reports: [] })),
                getAdminUsers({
                    page: currentPage,
                    limit: 20,
                    search: userSearch || undefined,
                    status: userStatusFilter !== "all" ? userStatusFilter : undefined,
                    role: userRoleFilter !== "all" ? userRoleFilter : undefined,
                    gender: userGenderFilter !== "all" ? userGenderFilter : undefined,
                    isVerified: userVerifiedFilter !== "all" ? userVerifiedFilter : undefined,
                }).catch(() => ({ users: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } })),
            ])

            if (statsRes) setStats(statsRes)
            setVerifications(vRes.verifications || (Array.isArray(vRes) ? vRes : []))
            setReports(rRes.reports || (Array.isArray(rRes) ? rRes : []))
            setUsers(uRes.users || (Array.isArray(uRes) ? uRes : []))
            if (uRes.pagination) {
                setUserPagination(uRes.pagination)
            }
        } catch (err) {
            console.error("Failed to load admin dashboard data:", err)
            addToast("Failed to fetch fresh dashboard data", "error")
        } finally {
            setLoading(false)
        }
    }, [currentPage, userSearch, userStatusFilter, userRoleFilter, userGenderFilter, userVerifiedFilter, addToast])

    useEffect(() => {
        fetchAllData()
    }, [fetchAllData])

    // KYC Review Handler
    const handleReviewVerification = async (id, status) => {
        setActionLoading(id)
        try {
            await reviewAdminVerification(id, status, verificationNote)
            const isApproved = status === "verified" || status === "approved"
            addToast(`Verification marked as ${isApproved ? "Approved & Verified" : "Rejected"}.`, "success")
            setSelectedVerification(null)
            setVerificationNote("")
            fetchAllData()
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update verification status"
            addToast(msg, "error")
        } finally {
            setActionLoading(null)
        }
    }

    // Report Status Handler
    const handleUpdateReport = async (id, status, banReportedUser = false, reportedUserId = null) => {
        setActionLoading(id)
        try {
            await updateAdminReportStatus(id, status, reportActionNote)
            if (banReportedUser && reportedUserId) {
                await updateAdminUserStatus(reportedUserId, "banned")
                addToast(`Report marked as ${status} and reported user banned.`, "success")
            } else {
                addToast(`Report marked as ${status}.`, "success")
            }
            setSelectedReport(null)
            setReportActionNote("")
            fetchAllData()
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update report status"
            addToast(msg, "error")
        } finally {
            setActionLoading(null)
        }
    }

    // User Status Update Handler (Active / Inactive / Banned)
    const handleUpdateUserStatus = async (userId, newStatus) => {
        setActionLoading(userId)
        try {
            await updateAdminUserStatus(userId, newStatus)
            addToast(`User account status updated to ${newStatus}.`, "success")
            if (selectedUserDetail?.user?._id === userId) {
                setSelectedUserDetail((prev) => ({
                    ...prev,
                    user: { ...prev.user, status: newStatus },
                }))
            }
            fetchAllData()
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to change user status"
            addToast(msg, "error")
        } finally {
            setActionLoading(null)
        }
    }

    // User Role Update Handler
    const handleUpdateUserRole = async (userId, newRole) => {
        setActionLoading(userId)
        try {
            await updateAdminUserRole(userId, newRole)
            addToast(`User role successfully changed to ${newRole.toUpperCase()}.`, "success")
            if (selectedUserDetail?.user?._id === userId) {
                setSelectedUserDetail((prev) => ({
                    ...prev,
                    user: { ...prev.user, role: newRole },
                }))
            }
            setRoleConfirm(null)
            fetchAllData()
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to change user role"
            addToast(msg, "error")
        } finally {
            setActionLoading(null)
        }
    }

    // Toggle Verification Badge
    const handleToggleVerification = async (userId, currentVerified) => {
        setActionLoading(userId)
        try {
            const updated = await toggleAdminUserVerification(userId, !currentVerified)
            addToast(`User profile is now ${!currentVerified ? "verified" : "unverified"}.`, "success")
            if (selectedUserDetail?.user?._id === userId) {
                setSelectedUserDetail((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, isVerified: !currentVerified },
                }))
            }
            fetchAllData()
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to toggle verification badge"
            addToast(msg, "error")
        } finally {
            setActionLoading(null)
        }
    }

    // View User Details Dossier
    const handleViewUserDetails = async (userId) => {
        setLoadingUserDetail(true)
        try {
            const data = await getAdminUserById(userId)
            setSelectedUserDetail(data)
        } catch (err) {
            addToast("Failed to fetch full user dossier", "error")
        } finally {
            setLoadingUserDetail(false)
        }
    }

    // Delete User Handler
    const handleDeleteUser = (userId, userName) => {
        setDeleteConfirm({ userId, userName })
    }

    const performDeleteUser = async () => {
        if (!deleteConfirm) return
        const { userId, userName } = deleteConfirm
        setActionLoading(userId)
        try {
            await deleteAdminUser(userId)
            addToast(`User account "${userName}" permanently deleted.`, "success")
            if (selectedUserDetail?.user?._id === userId) {
                setSelectedUserDetail(null)
            }
            setDeleteConfirm(null)
            fetchAllData()
        } catch (err) {
            addToast("Failed to delete user account", "error")
        } finally {
            setActionLoading(null)
        }
    }

    // Counts computation
    const pendingVerificationsCount = verifications.filter((v) =>
        ["submitted", "under_review", "pending"].includes(v.status)
    ).length
    const pendingReportsCount = reports.filter((r) => r.status === "pending").length
    const totalVerifiedProfiles = users.filter((u) => u.isVerified).length

    // Filtered lists
    const filteredVerifications = verifications.filter((v) => {
        if (verificationFilter === "all") return true
        if (verificationFilter === "pending") return ["submitted", "under_review", "pending"].includes(v.status)
        if (verificationFilter === "verified") return ["verified", "approved"].includes(v.status)
        if (verificationFilter === "rejected") return v.status === "rejected"
        return true
    })

    const filteredReports = reports.filter((r) => {
        if (reportFilter === "all") return true
        return r.status === reportFilter
    })

    return (
        <div className="min-h-screen bg-[#FBF9F9] flex flex-col font-sans text-gray-800">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="px-3 py-1 rounded-full bg-rose-100 text-[#842029] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
                                <ShieldCheck size={14} /> Administration Console
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                                Live Database &amp; Cache
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#640515]">
                            MeriJodi Admin Portal
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Supervise member directories, review KYC verification documents, resolve abuse reports, and monitor platform KPIs.
                        </p>
                    </div>
                    <button
                        onClick={fetchAllData}
                        className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 flex items-center gap-2 shadow-2xs cursor-pointer transition-all active:scale-95"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin text-[#842029]" : ""} /> Refresh Data
                    </button>
                </div>

                {/* Metrics Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Users size={22} />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Total Users</p>
                            <h3 className="text-xl sm:text-2xl font-bold font-serif text-gray-900">
                                {stats?.counts?.totalUsers ?? users.length}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <UserCheck size={22} />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Verified Profiles</p>
                            <h3 className="text-xl sm:text-2xl font-bold font-serif text-gray-900">
                                {stats?.counts?.verifiedProfiles ?? totalVerifiedProfiles}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[#FFF0F2] text-[#842029] flex items-center justify-center shrink-0">
                            <FileText size={22} />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Pending KYC</p>
                            <h3 className="text-xl sm:text-2xl font-bold font-serif text-gray-900">
                                {pendingVerificationsCount}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <AlertTriangle size={22} />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Safety Reports</p>
                            <h3 className="text-xl sm:text-2xl font-bold font-serif text-gray-900">
                                {pendingReportsCount}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Main Navigation Tabs */}
                <div className="flex border-b border-gray-200 mb-6 gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                            activeTab === "overview"
                                ? "border-[#842029] text-[#842029]"
                                : "border-transparent text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        <Activity size={16} /> Overview &amp; KPIs
                    </button>
                    <button
                        onClick={() => setActiveTab("verifications")}
                        className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                            activeTab === "verifications"
                                ? "border-[#842029] text-[#842029]"
                                : "border-transparent text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        <ShieldCheck size={16} /> KYC Verifications
                        {pendingVerificationsCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-[#842029] text-[10px] font-bold">
                                {pendingVerificationsCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("reports")}
                        className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                            activeTab === "reports"
                                ? "border-[#842029] text-[#842029]"
                                : "border-transparent text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        <AlertTriangle size={16} /> Abuse Reports
                        {pendingReportsCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                {pendingReportsCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                            activeTab === "users"
                                ? "border-[#842029] text-[#842029]"
                                : "border-transparent text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        <Users size={16} /> User Directory ({userPagination.total || users.length})
                    </button>
                </div>

                {/* TAB 1: OVERVIEW & KPIS */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* Demographic & Match Engagement Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Heart size={16} className="text-[#842029]" /> Matchmaking Engagement
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Total Interests Expressed</span>
                                        <span className="font-bold text-gray-800">{stats?.counts?.totalInterests || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Accepted Matches</span>
                                        <span className="font-bold text-emerald-600">{stats?.counts?.acceptedInterests || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Total Chat Messages</span>
                                        <span className="font-bold text-gray-800">{stats?.counts?.totalMessages || 0}</span>
                                    </div>
                                    <div className="pt-2">
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="bg-[#842029] h-2 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${
                                                        stats?.counts?.totalInterests
                                                            ? Math.min(100, Math.round(((stats.counts.acceptedInterests || 0) / stats.counts.totalInterests) * 100))
                                                            : 0
                                                    }%`,
                                                }}
                                            />
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-1.5 text-right font-medium">
                                            {stats?.counts?.totalInterests
                                                ? Math.round(((stats.counts.acceptedInterests || 0) / stats.counts.totalInterests) * 100)
                                                : 0}
                                            % Match Acceptance Rate
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Users size={16} className="text-blue-600" /> Gender Demographics
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Male Profiles
                                        </span>
                                        <span className="font-bold text-gray-800">{stats?.demographics?.male || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Female Profiles
                                        </span>
                                        <span className="font-bold text-gray-800">{stats?.demographics?.female || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Verified Badge Ratio
                                        </span>
                                        <span className="font-bold text-emerald-600">
                                            {stats?.counts?.totalProfiles
                                                ? Math.round(((stats.counts.verifiedProfiles || 0) / stats.counts.totalProfiles) * 100)
                                                : 100}
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Activity size={16} className="text-emerald-600" /> System &amp; Services
                                </h3>
                                <div className="space-y-3 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Database Engine</span>
                                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> MongoDB Atlas
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Cache / TTL Store</span>
                                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Redis Connected
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">AI Biodata Engine</span>
                                        <span className="font-bold text-emerald-700">Gemini &amp; Groq Active</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Real-Time Messaging</span>
                                        <span className="font-bold text-emerald-700">Socket.io Operational</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fast Action Preview Queues */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Pending Verifications Quick List */}
                            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-[#640515] flex items-center gap-2">
                                        <ShieldCheck size={18} /> Pending KYC Documents ({pendingVerificationsCount})
                                    </h3>
                                    <button
                                        onClick={() => setActiveTab("verifications")}
                                        className="text-xs font-semibold text-[#842029] hover:underline cursor-pointer"
                                    >
                                        View All →
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {verifications
                                        .filter((v) => ["submitted", "under_review", "pending"].includes(v.status))
                                        .slice(0, 4)
                                        .map((v) => (
                                            <div
                                                key={v._id}
                                                className="p-3.5 rounded-2xl bg-rose-50/30 border border-rose-100 flex items-center justify-between gap-3"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-xs text-gray-900 truncate">
                                                        {v.profileId?.name || "Applicant"}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 capitalize truncate">
                                                        {v.documentType?.replace(/_/g, " ") || "Government ID"} • {v.profileId?.location?.city || "India"}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedVerification(v)}
                                                    className="px-3.5 py-1.5 rounded-lg bg-[#842029] hover:bg-[#640515] text-white text-xs font-semibold cursor-pointer shadow-2xs shrink-0"
                                                >
                                                    Inspect
                                                </button>
                                            </div>
                                        ))}
                                    {pendingVerificationsCount === 0 && (
                                        <p className="text-center text-xs text-gray-400 py-6">
                                            All verification requests have been reviewed.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Pending Reports Quick List */}
                            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-[#640515] flex items-center gap-2">
                                        <AlertTriangle size={18} /> Pending Safety Reports ({pendingReportsCount})
                                    </h3>
                                    <button
                                        onClick={() => setActiveTab("reports")}
                                        className="text-xs font-semibold text-[#842029] hover:underline cursor-pointer"
                                    >
                                        View All →
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {reports
                                        .filter((r) => r.status === "pending")
                                        .slice(0, 4)
                                        .map((r) => (
                                            <div
                                                key={r._id}
                                                className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-100 flex items-center justify-between gap-3"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-xs text-gray-900 truncate">
                                                        {r.reportedProfileId?.name || "Reported Member"}
                                                    </p>
                                                    <p className="text-[11px] text-amber-800 capitalize font-medium truncate">
                                                        Reason: {r.reason?.replace(/_/g, " ")}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedReport(r)}
                                                    className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer shadow-2xs shrink-0"
                                                >
                                                    Review
                                                </button>
                                            </div>
                                        ))}
                                    {pendingReportsCount === 0 && (
                                        <p className="text-center text-xs text-gray-400 py-6">
                                            No outstanding safety reports filed.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: KYC VERIFICATIONS */}
                {activeTab === "verifications" && (
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-gray-400" />
                                <select
                                    value={verificationFilter}
                                    onChange={(e) => setVerificationFilter(e.target.value)}
                                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 outline-none bg-white cursor-pointer"
                                >
                                    <option value="all">All Verification Statuses</option>
                                    <option value="pending">Pending Review Only</option>
                                    <option value="verified">Verified / Approved</option>
                                    <option value="rejected">Rejected Only</option>
                                </select>
                            </div>
                            <span className="text-xs text-gray-400">
                                Showing {filteredVerifications.length} submissions
                            </span>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center text-xs text-gray-400">Loading verifications...</div>
                        ) : filteredVerifications.length === 0 ? (
                            <div className="p-12 text-center text-xs text-gray-400">No verification requests found.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-400 font-semibold text-[11px] uppercase tracking-wider">
                                            <th className="pb-3 px-3">Applicant</th>
                                            <th className="pb-3 px-3">Document Type</th>
                                            <th className="pb-3 px-3">Submitted</th>
                                            <th className="pb-3 px-3">Status</th>
                                            <th className="pb-3 px-3">Review Notes</th>
                                            <th className="pb-3 px-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredVerifications.map((v) => {
                                            const isPending = ["submitted", "under_review", "pending"].includes(v.status)
                                            return (
                                                <tr key={v._id} className="hover:bg-rose-50/20 transition-colors">
                                                    <td className="py-3 px-3 font-bold text-gray-900">
                                                        {v.profileId?.name || "MeriJodi Member"}
                                                        <div className="text-[11px] text-gray-400 font-normal">
                                                            {v.profileId?.location?.city || "India"}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 capitalize font-medium">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <FileText size={14} className="text-gray-400" />
                                                            {v.documentType?.replace(/_/g, " ") || "Govt ID"}
                                                        </span>
                                                        {v.documentUrl && (
                                                            <a
                                                                href={v.documentUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="block text-[11px] text-[#842029] hover:underline mt-0.5"
                                                            >
                                                                View Doc ↗
                                                            </a>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3 text-gray-500 text-xs">
                                                        {new Date(v.createdAt).toLocaleDateString([], {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <span
                                                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                                v.status === "verified" || v.status === "approved"
                                                                    ? "bg-emerald-100 text-emerald-800"
                                                                    : v.status === "rejected"
                                                                    ? "bg-rose-100 text-rose-800"
                                                                    : "bg-amber-100 text-amber-800"
                                                            }`}
                                                        >
                                                            {v.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 text-xs text-gray-500 max-w-xs truncate">
                                                        {v.reviewNote || "—"}
                                                    </td>
                                                    <td className="py-3 px-3 text-right">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedVerification(v)
                                                                setVerificationNote(v.reviewNote || "")
                                                            }}
                                                            className="px-3.5 py-1.5 rounded-lg bg-[#842029] hover:bg-[#640515] text-white text-xs font-semibold cursor-pointer shadow-2xs inline-flex items-center gap-1"
                                                        >
                                                            <Eye size={13} /> {isPending ? "Review" : "Inspect"}
                                                        </button>
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

                {/* TAB 3: SAFETY & ABUSE REPORTS */}
                {activeTab === "reports" && (
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-gray-400" />
                                <select
                                    value={reportFilter}
                                    onChange={(e) => setReportFilter(e.target.value)}
                                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 outline-none bg-white cursor-pointer"
                                >
                                    <option value="all">All Report Statuses</option>
                                    <option value="pending">Pending Review Only</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="dismissed">Dismissed</option>
                                </select>
                            </div>
                            <span className="text-xs text-gray-400">
                                Showing {filteredReports.length} reports
                            </span>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center text-xs text-gray-400">Loading abuse reports...</div>
                        ) : filteredReports.length === 0 ? (
                            <div className="p-12 text-center text-xs text-gray-400">No safety reports in this category.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-400 font-semibold text-[11px] uppercase tracking-wider">
                                            <th className="pb-3 px-3">Reported Member</th>
                                            <th className="pb-3 px-3">Reporter</th>
                                            <th className="pb-3 px-3">Violation Reason</th>
                                            <th className="pb-3 px-3">Reported On</th>
                                            <th className="pb-3 px-3">Status</th>
                                            <th className="pb-3 px-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredReports.map((r) => (
                                            <tr key={r._id} className="hover:bg-amber-50/20 transition-colors">
                                                <td className="py-3 px-3 font-bold text-gray-900">
                                                    {r.reportedProfileId?.name || "Reported Member"}
                                                </td>
                                                <td className="py-3 px-3 text-gray-600">
                                                    {r.reporterProfileId?.name || "Member"}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200 capitalize">
                                                        {r.reason?.replace(/_/g, " ")}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-gray-500 text-xs">
                                                    {new Date(r.createdAt).toLocaleDateString([], {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                                <td className="py-3 px-3">
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
                                                <td className="py-3 px-3 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedReport(r)
                                                            setReportActionNote(r.actionTaken || "")
                                                        }}
                                                        className="px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold cursor-pointer shadow-2xs"
                                                    >
                                                        Inspect Report
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: USER DIRECTORY & MANAGEMENT */}
                {activeTab === "users" && (
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                            <div className="relative flex-1 max-w-md">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, phone, city, occupation..."
                                    value={userSearch}
                                    onChange={(e) => {
                                        setUserSearch(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-[#842029] bg-gray-50/50"
                                />
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <select
                                    value={userStatusFilter}
                                    onChange={(e) => {
                                        setUserStatusFilter(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 outline-none bg-white cursor-pointer"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="banned">Banned</option>
                                </select>

                                <select
                                    value={userRoleFilter}
                                    onChange={(e) => {
                                        setUserRoleFilter(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 outline-none bg-white cursor-pointer"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="user">Member (User)</option>
                                    <option value="admin">Administrator</option>
                                </select>

                                <select
                                    value={userGenderFilter}
                                    onChange={(e) => {
                                        setUserGenderFilter(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 outline-none bg-white cursor-pointer"
                                >
                                    <option value="all">All Genders</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>

                                <select
                                    value={userVerifiedFilter}
                                    onChange={(e) => {
                                        setUserVerifiedFilter(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 outline-none bg-white cursor-pointer"
                                >
                                    <option value="all">Verification Badge</option>
                                    <option value="true">Verified Only</option>
                                    <option value="false">Unverified Only</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center text-xs text-gray-400">Loading users...</div>
                        ) : users.length === 0 ? (
                            <div className="p-12 text-center text-xs text-gray-400">No users match the search and filter criteria.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[750px]">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-400 font-semibold text-[11px] uppercase tracking-wider">
                                            <th className="pb-3 px-3">Member</th>
                                            <th className="pb-3 px-3">Contact</th>
                                            <th className="pb-3 px-3">Location &amp; Career</th>
                                            <th className="pb-3 px-3">Role</th>
                                            <th className="pb-3 px-3">Status</th>
                                            <th className="pb-3 px-3">Verification</th>
                                            <th className="pb-3 px-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {users.map((u) => {
                                            const isBanned = u.status === "banned"
                                            const isAdmin = u.role === "admin"
                                            return (
                                                <tr key={u._id} className="hover:bg-rose-50/20 transition-colors">
                                                    <td className="py-3.5 px-3">
                                                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                                            {u.name}
                                                            {isAdmin && (
                                                                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[9px] font-extrabold uppercase tracking-wider">
                                                                    Admin
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 capitalize">
                                                            {u.gender || "Not specified"} • Profile {u.profileCompletionPct || 50}%
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-3 text-xs text-gray-600">
                                                        <div>{u.email}</div>
                                                        <div className="text-[11px] text-gray-400">{u.phone || "No phone"}</div>
                                                    </td>
                                                    <td className="py-3.5 px-3 text-xs text-gray-600">
                                                        <div className="font-medium text-gray-800">{u.location?.city || "India"}</div>
                                                        <div className="text-[11px] text-gray-400">{u.career?.occupation || "Professional"}</div>
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <button
                                                            onClick={() =>
                                                                setRoleConfirm({
                                                                    userId: u._id,
                                                                    userName: u.name,
                                                                    nextRole: isAdmin ? "user" : "admin",
                                                                })
                                                            }
                                                            title={isAdmin ? "Demote to standard Member" : "Promote to Admin"}
                                                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase cursor-pointer transition-all ${
                                                                isAdmin
                                                                    ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                            }`}
                                                        >
                                                            {u.role} ⇅
                                                        </button>
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <span
                                                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                                u.status === "active"
                                                                    ? "bg-emerald-100 text-emerald-800"
                                                                    : u.status === "banned"
                                                                    ? "bg-red-100 text-red-800"
                                                                    : "bg-gray-100 text-gray-700"
                                                            }`}
                                                        >
                                                            {u.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        {u.isVerified ? (
                                                            <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                                                                <CheckCircle size={14} /> Verified
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs font-medium">Unverified</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-3 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => handleViewUserDetails(u._id)}
                                                                title="Inspect Full Profile Dossier"
                                                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer shadow-2xs"
                                                            >
                                                                <Eye size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleVerification(u._id, u.isVerified)}
                                                                title={u.isVerified ? "Remove Verification Badge" : "Grant Verified Badge"}
                                                                disabled={actionLoading === u._id}
                                                                className={`p-1.5 rounded-lg cursor-pointer shadow-2xs transition-all ${
                                                                    u.isVerified
                                                                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                                }`}
                                                            >
                                                                <UserCheck size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateUserStatus(u._id, isBanned ? "active" : "banned")}
                                                                title={isBanned ? "Unban Account" : "Ban User Account"}
                                                                disabled={actionLoading === u._id}
                                                                className={`p-1.5 rounded-lg cursor-pointer shadow-2xs transition-all ${
                                                                    isBanned
                                                                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                                                        : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                                                }`}
                                                            >
                                                                <UserX size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(u._id, u.name)}
                                                                title="Delete User Permanently"
                                                                disabled={actionLoading === u._id}
                                                                className="p-1.5 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 cursor-pointer shadow-2xs"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {userPagination.totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4 text-xs text-gray-500">
                                <div>
                                    Page {userPagination.page} of {userPagination.totalPages} ({userPagination.total} Total Users)
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={userPagination.page <= 1}
                                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(userPagination.totalPages, p + 1))}
                                        disabled={userPagination.page >= userPagination.totalPages}
                                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* MODAL 1: VERIFICATION REVIEW */}
            {selectedVerification && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-[#640515] text-base flex items-center gap-2">
                                <ShieldCheck size={20} /> Review KYC Submission
                            </h3>
                            <button
                                onClick={() => setSelectedVerification(null)}
                                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase">Applicant Name</p>
                                <p className="font-bold text-gray-900 text-sm">
                                    {selectedVerification.profileId?.name || "MeriJodi Member"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase mb-1.5">
                                    Document Proof ({selectedVerification.documentType?.replace(/_/g, " ")})
                                </p>
                                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center max-h-64 p-2 relative group">
                                    {selectedVerification.documentUrl ? (
                                        selectedVerification.documentUrl.match(/\.(jpeg|jpg|png|webp|gif)/i) || !selectedVerification.documentUrl.includes(".pdf") ? (
                                            <img
                                                src={selectedVerification.documentUrl}
                                                alt="KYC Document"
                                                className="w-full h-auto object-contain max-h-60 rounded-xl"
                                            />
                                        ) : (
                                            <div className="p-8 text-center">
                                                <FileText size={36} className="mx-auto text-[#842029] mb-2" />
                                                <p className="text-xs font-semibold text-gray-700">PDF Document Uploaded</p>
                                                <a
                                                    href={selectedVerification.documentUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#842029] hover:underline"
                                                >
                                                    Open Document in New Tab <ExternalLink size={12} />
                                                </a>
                                            </div>
                                        )
                                    ) : (
                                        <p className="p-8 text-xs text-gray-400">No document image preview available.</p>
                                    )}
                                </div>
                                {selectedVerification.documentUrl && (
                                    <div className="mt-1 text-right">
                                        <a
                                            href={selectedVerification.documentUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[11px] font-semibold text-[#842029] hover:underline inline-flex items-center gap-1"
                                        >
                                            Open Full Document in New Tab <ExternalLink size={12} />
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Admin Review Note (optional feedback)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Verified valid government photo identification"
                                    value={verificationNote}
                                    onChange={(e) => setVerificationNote(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#842029]"
                                />
                            </div>

                            <div className="flex gap-2.5 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => handleReviewVerification(selectedVerification._id, "rejected")}
                                    disabled={actionLoading === selectedVerification._id}
                                    className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                                >
                                    <XCircle size={14} /> Reject Document
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleReviewVerification(selectedVerification._id, "verified")}
                                    disabled={actionLoading === selectedVerification._id}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1.5"
                                >
                                    <CheckCircle size={14} /> Approve &amp; Verify Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: ABUSE REPORT INSPECTION */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-amber-800 text-base flex items-center gap-2">
                                <AlertTriangle size={20} /> Inspect Safety Report
                            </h3>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase">Reported Member</p>
                                    <p className="font-bold text-gray-900 text-sm">
                                        {selectedReport.reportedProfileId?.name || "Reported Member"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase">Violation Reason</p>
                                    <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-bold capitalize">
                                        {selectedReport.reason?.replace(/_/g, " ")}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200">
                                <p className="text-[11px] font-bold text-amber-900 mb-1">Reporter Description:</p>
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    {selectedReport.description || "No additional commentary provided by reporter."}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Resolution / Action Taken Note
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Warning issued to user, inappropriate content removed"
                                    value={reportActionNote}
                                    onChange={(e) => setReportActionNote(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-600"
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => handleUpdateReport(selectedReport._id, "dismissed")}
                                    disabled={actionLoading === selectedReport._id}
                                    className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold cursor-pointer"
                                >
                                    Dismiss Report
                                </button>
                                {selectedReport.reportedProfileId?.userId && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleUpdateReport(
                                                selectedReport._id,
                                                "resolved",
                                                true,
                                                selectedReport.reportedProfileId?.userId?._id || selectedReport.reportedProfileId?.userId
                                            )
                                        }
                                        disabled={actionLoading === selectedReport._id}
                                        className="px-3.5 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold cursor-pointer"
                                    >
                                        Ban Reported User
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleUpdateReport(selectedReport._id, "resolved")}
                                    disabled={actionLoading === selectedReport._id}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-2xs"
                                >
                                    Mark as Resolved
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: FULL USER DOSSIER INSPECTOR */}
            {selectedUserDetail && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 p-6">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-[#640515] font-serif">
                                        {selectedUserDetail.user?.name || "Member Profile"}
                                    </h3>
                                    {selectedUserDetail.profile?.isVerified && (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                                            <CheckCircle size={12} /> Verified
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    User ID: {selectedUserDetail.user?._id} • Role: {selectedUserDetail.user?.role?.toUpperCase()} • Registered:{" "}
                                    {new Date(selectedUserDetail.user?.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedUserDetail(null)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Photo Gallery if available */}
                        {selectedUserDetail.profile?.photos?.length > 0 && (
                            <div className="mb-5">
                                <h4 className="font-bold text-[#842029] text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <ImageIcon size={14} /> Profile Photos ({selectedUserDetail.profile.photos.length})
                                </h4>
                                <div className="flex gap-2.5 overflow-x-auto pb-2">
                                    {selectedUserDetail.profile.photos.map((p, idx) => {
                                        const url = typeof p === "string" ? p : p.url
                                        return (
                                            <a
                                                key={idx}
                                                href={url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-20 h-24 rounded-xl border border-gray-200 overflow-hidden shrink-0 bg-gray-100 relative group"
                                            >
                                                <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                            </a>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="space-y-5 text-xs text-gray-700">
                            {/* Personal Details */}
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <h4 className="font-bold text-[#842029] text-xs uppercase tracking-wider mb-2.5">
                                    Personal &amp; Horoscope
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div><span className="text-gray-400">Gender:</span> <p className="font-bold capitalize">{selectedUserDetail.profile?.gender || "—"}</p></div>
                                    <div><span className="text-gray-400">DOB:</span> <p className="font-bold">{selectedUserDetail.profile?.dateOfBirth ? new Date(selectedUserDetail.profile.dateOfBirth).toLocaleDateString() : "—"}</p></div>
                                    <div><span className="text-gray-400">Birth Place:</span> <p className="font-bold">{selectedUserDetail.profile?.placeOfBirth || "—"}</p></div>
                                    <div><span className="text-gray-400">Birth Time:</span> <p className="font-bold">{selectedUserDetail.profile?.timeOfBirth || "—"}</p></div>
                                    <div><span className="text-gray-400">Religion:</span> <p className="font-bold">{selectedUserDetail.profile?.religion || "—"}</p></div>
                                    <div><span className="text-gray-400">Caste:</span> <p className="font-bold">{selectedUserDetail.profile?.caste || "—"}</p></div>
                                    <div><span className="text-gray-400">Gotra:</span> <p className="font-bold">{selectedUserDetail.profile?.gotham || "—"}</p></div>
                                    <div><span className="text-gray-400">Rashi / Nakshatra:</span> <p className="font-bold">{selectedUserDetail.profile?.rashi || "—"} / {selectedUserDetail.profile?.nakshtra || "—"}</p></div>
                                    <div><span className="text-gray-400">Manglik:</span> <p className="font-bold capitalize">{selectedUserDetail.profile?.manglik || "—"}</p></div>
                                    <div><span className="text-gray-400">Marital Status:</span> <p className="font-bold capitalize">{selectedUserDetail.profile?.maritalStatus?.replace(/_/g, " ") || "—"}</p></div>
                                    <div><span className="text-gray-400">Height:</span> <p className="font-bold">{selectedUserDetail.profile?.heightCm ? `${selectedUserDetail.profile.heightCm} cm` : "—"}</p></div>
                                    <div><span className="text-gray-400">Mother Tongue:</span> <p className="font-bold">{selectedUserDetail.profile?.motherTongue || "—"}</p></div>
                                </div>
                            </div>

                            {/* Career & Location */}
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <h4 className="font-bold text-[#842029] text-xs uppercase tracking-wider mb-2.5">
                                    Career &amp; Location
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div><span className="text-gray-400">Highest Education:</span> <p className="font-bold">{selectedUserDetail.profile?.education?.highestDegree || "—"}</p></div>
                                    <div><span className="text-gray-400">Occupation:</span> <p className="font-bold">{selectedUserDetail.profile?.career?.occupation || "—"}</p></div>
                                    <div><span className="text-gray-400">Company:</span> <p className="font-bold">{selectedUserDetail.profile?.career?.companyName || "—"}</p></div>
                                    <div><span className="text-gray-400">Annual Income:</span> <p className="font-bold">{selectedUserDetail.profile?.career?.annualIncome || "—"}</p></div>
                                    <div><span className="text-gray-400">City / State:</span> <p className="font-bold">{selectedUserDetail.profile?.location?.city || "—"}, {selectedUserDetail.profile?.location?.state || ""}</p></div>
                                    <div><span className="text-gray-400">Country:</span> <p className="font-bold">{selectedUserDetail.profile?.location?.country || "India"}</p></div>
                                </div>
                            </div>

                            {/* Family Details */}
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <h4 className="font-bold text-[#842029] text-xs uppercase tracking-wider mb-2.5">
                                    Family Background
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div><span className="text-gray-400">Father's Occupation:</span> <p className="font-bold">{selectedUserDetail.profile?.family?.fatherOccupation || "—"}</p></div>
                                    <div><span className="text-gray-400">Mother's Occupation:</span> <p className="font-bold">{selectedUserDetail.profile?.family?.motherOccupation || "—"}</p></div>
                                    <div><span className="text-gray-400">Family Type:</span> <p className="font-bold capitalize">{selectedUserDetail.profile?.family?.familyType || "—"}</p></div>
                                </div>
                            </div>

                            {/* About Me Bio */}
                            {selectedUserDetail.profile?.aboutMe && (
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                    <h4 className="font-bold text-[#842029] text-xs uppercase tracking-wider mb-1.5">
                                        About Me / Bio
                                    </h4>
                                    <p className="text-xs text-gray-700 leading-relaxed">
                                        {selectedUserDetail.profile.aboutMe}
                                    </p>
                                </div>
                            )}

                            {/* Safety Reports History */}
                            {selectedUserDetail.reportsAgainst?.length > 0 && (
                                <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                                    <h4 className="font-bold text-red-900 text-xs uppercase tracking-wider mb-2">
                                        Abuse Reports Against This User ({selectedUserDetail.reportsAgainst.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedUserDetail.reportsAgainst.map((rep) => (
                                            <div key={rep._id} className="text-xs text-red-800">
                                                • <strong>{rep.reason}</strong>: {rep.description || "No comment"} ({rep.status})
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* KYC Verification History */}
                            {selectedUserDetail.verifications?.length > 0 && (
                                <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-200">
                                    <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-2">
                                        KYC Submissions ({selectedUserDetail.verifications.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedUserDetail.verifications.map((doc) => (
                                            <div key={doc._id} className="text-xs text-blue-800 flex items-center justify-between">
                                                <span>
                                                    • <strong>{doc.documentType?.replace(/_/g, " ")}</strong> ({doc.status})
                                                </span>
                                                {doc.documentUrl && (
                                                    <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="underline font-bold text-blue-900">
                                                        Inspect Doc ↗
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Dossier Action Bar */}
                        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={() =>
                                        handleToggleVerification(selectedUserDetail.user._id, selectedUserDetail.profile?.isVerified)
                                    }
                                    disabled={actionLoading === selectedUserDetail.user._id}
                                    className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                                >
                                    <UserCheck size={14} />
                                    {selectedUserDetail.profile?.isVerified ? "Revoke Verified Badge" : "Grant Verified Badge"}
                                </button>
                                <button
                                    onClick={() =>
                                        handleUpdateUserStatus(
                                            selectedUserDetail.user._id,
                                            selectedUserDetail.user.status === "banned" ? "active" : "banned"
                                        )
                                    }
                                    disabled={actionLoading === selectedUserDetail.user._id}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                                        selectedUserDetail.user.status === "banned"
                                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                            : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                    }`}
                                >
                                    <UserX size={14} />
                                    {selectedUserDetail.user.status === "banned" ? "Unban Account" : "Ban Account"}
                                </button>
                                <button
                                    onClick={() =>
                                        handleDeleteUser(selectedUserDetail.user._id, selectedUserDetail.user.name)
                                    }
                                    className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 hover:bg-rose-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Trash2 size={14} /> Delete User
                                </button>
                            </div>

                            <button
                                onClick={() => setSelectedUserDetail(null)}
                                className="px-5 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold cursor-pointer"
                            >
                                Close Dossier
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRM DELETE MODAL */}
            <ConfirmModal
                isOpen={Boolean(deleteConfirm)}
                title="Permanently Delete Account"
                message={`Are you sure you want to permanently delete user "${deleteConfirm?.userName || "this member"}"? All associated biodata, photos, messages, and preferences will be permanently wiped.`}
                confirmText="Delete Account"
                cancelText="Cancel"
                type="danger"
                loading={actionLoading === deleteConfirm?.userId}
                onConfirm={performDeleteUser}
                onCancel={() => setDeleteConfirm(null)}
            />

            {/* CONFIRM ROLE CHANGE MODAL */}
            <ConfirmModal
                isOpen={Boolean(roleConfirm)}
                title="Change User Access Role"
                message={`Are you sure you want to change role for "${roleConfirm?.userName}" to ${roleConfirm?.nextRole?.toUpperCase()}?`}
                confirmText={`Promote to ${roleConfirm?.nextRole?.toUpperCase()}`}
                cancelText="Cancel"
                type="info"
                loading={actionLoading === roleConfirm?.userId}
                onConfirm={() => handleUpdateUserRole(roleConfirm.userId, roleConfirm.nextRole)}
                onCancel={() => setRoleConfirm(null)}
            />

            <Footer />
        </div>
    )
}
