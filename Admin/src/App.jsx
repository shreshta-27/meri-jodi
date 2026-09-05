import { useState, useEffect, useCallback } from "react"
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  LogOut,
  Search,
  Menu,
  X,
  FileText,
  Activity,
  UserCheck,
  UserX,
  Trash2,
  ExternalLink,
  Filter,
  RefreshCw,
  Heart,
  MessageCircle,
  Clock,
  Shield,
  Check
} from "lucide-react"

const API_BASE = "http://localhost:5000/api"

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") || "")
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("admin_user") || "null")
    } catch {
      return null
    }
  })

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  // Navigation state
  const [currentTab, setCurrentTab] = useState("overview") // 'overview' | 'verifications' | 'reports' | 'users'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data states
  const [stats, setStats] = useState(null)
  const [verifications, setVerifications] = useState([])
  const [reports, setReports] = useState([])
  const [usersList, setUsersList] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  
  // Filters
  const [verificationFilter, setVerificationFilter] = useState("all")
  const [reportFilter, setReportFilter] = useState("all")
  const [userStatusFilter, setUserStatusFilter] = useState("all")
  const [userRoleFilter, setUserRoleFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Action Modals
  const [selectedVerification, setSelectedVerification] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedUserDetail, setSelectedUserDetail] = useState(null)
  const [loadingUserDetail, setLoadingUserDetail] = useState(false)
  const [actionNote, setActionNote] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(""), 3500)
  }

  // Handle Admin Login
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError("")
    setLoginLoading(true)
    try {
      let res = await fetch(`${API_BASE}/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      })
      let data = await res.json()

      if (!res.ok && res.status !== 401 && res.status !== 403) {
        res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
        })
        data = await res.json()
      }

      if (!res.ok) throw new Error(data.message || "Login failed")

      const adm = data.data?.user || data.user || { name: "Admin", email: loginEmail, role: "admin" }
      const t = data.data?.accessToken || data.data?.token || data.token || "admin_session_token"
      setToken(t)
      setAdminUser(adm)
      localStorage.setItem("admin_token", t)
      localStorage.setItem("admin_user", JSON.stringify(adm))
    } catch (err) {
      setLoginError(err.message)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    setToken("")
    setAdminUser(null)
  }

  // Fetch Dashboard Stats & Overview
  const fetchStats = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/v1/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setStats(json.data)
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err)
    }
  }, [token])

  // Fetch Verifications
  const fetchVerifications = useCallback(async () => {
    if (!token) return
    setLoadingData(true)
    try {
      const res = await fetch(`${API_BASE}/v1/verifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setVerifications(json.data?.verifications || (Array.isArray(json.data) ? json.data : []))
      }
    } catch (err) {
      console.error("Failed to fetch verifications:", err)
    } finally {
      setLoadingData(false)
    }
  }, [token])

  // Fetch Reports
  const fetchReports = useCallback(async () => {
    if (!token) return
    setLoadingData(true)
    try {
      const res = await fetch(`${API_BASE}/v1/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setReports(json.data?.reports || (Array.isArray(json.data) ? json.data : []))
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err)
    } finally {
      setLoadingData(false)
    }
  }, [token])

  // Fetch Users via Admin Users endpoint
  const fetchUsers = useCallback(async () => {
    if (!token) return
    setLoadingData(true)
    try {
      const params = new URLSearchParams({ limit: "100" })
      if (userStatusFilter !== "all") params.append("status", userStatusFilter)
      if (userRoleFilter !== "all") params.append("role", userRoleFilter)
      if (searchQuery.trim()) params.append("search", searchQuery.trim())

      const res = await fetch(`${API_BASE}/v1/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setUsersList(json.data?.users || (Array.isArray(json.data) ? json.data : []))
      }
    } catch (err) {
      console.error("Failed to fetch admin users:", err)
    } finally {
      setLoadingData(false)
    }
  }, [token, userStatusFilter, userRoleFilter, searchQuery])

  // Fetch User Full Dossier Detail
  const fetchUserDetail = async (userId) => {
    setLoadingUserDetail(true)
    try {
      const res = await fetch(`${API_BASE}/v1/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setSelectedUserDetail(json.data)
      } else {
        alert(json.message || "Failed to load user details")
      }
    } catch (err) {
      alert("Error loading user details: " + err.message)
    } finally {
      setLoadingUserDetail(false)
    }
  }

  // Reload all data
  const refreshAll = () => {
    fetchStats()
    fetchVerifications()
    fetchReports()
    fetchUsers()
  }

  useEffect(() => {
    if (!token) return
    fetchStats()
    if (currentTab === "overview") {
      fetchVerifications()
      fetchReports()
      fetchUsers()
    } else if (currentTab === "verifications") {
      fetchVerifications()
    } else if (currentTab === "reports") {
      fetchReports()
    } else if (currentTab === "users") {
      fetchUsers()
    }
  }, [token, currentTab, fetchStats, fetchVerifications, fetchReports, fetchUsers])

  // Review Verification Action (Approve / Reject)
  const handleReviewVerification = async (status) => {
    if (!selectedVerification) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API_BASE}/v1/verifications/${selectedVerification._id}/review`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, reviewNote: actionNote.trim() || undefined }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed to update verification")
      showToast(`Document ${status} successfully.`)
      setSelectedVerification(null)
      setActionNote("")
      fetchVerifications()
      fetchStats()
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Update Report Status (Resolved / Dismissed)
  const handleUpdateReport = async (status) => {
    if (!selectedReport) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API_BASE}/v1/reports/${selectedReport._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, actionTaken: actionNote.trim() || undefined, resolutionNotes: actionNote.trim() || undefined }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed to update report")
      showToast(`Report marked as ${status}.`)
      setSelectedReport(null)
      setActionNote("")
      fetchReports()
      fetchStats()
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Update User Status (active / banned / inactive)
  const handleUpdateUserStatus = async (userId, newStatus) => {
    if (!confirm(`Are you sure you want to change user status to "${newStatus}"?`)) return
    try {
      const res = await fetch(`${API_BASE}/v1/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed to update status")
      showToast(`User status updated to ${newStatus}`)
      fetchUsers()
      fetchStats()
      if (selectedUserDetail && selectedUserDetail.user?._id === userId) {
        fetchUserDetail(userId)
      }
    } catch (err) {
      alert(err.message)
    }
  }

  // Update User Role (user / admin)
  const handleUpdateUserRole = async (userId, newRole) => {
    if (!confirm(`Are you sure you want to change user role to "${newRole}"?`)) return
    try {
      const res = await fetch(`${API_BASE}/v1/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed to update role")
      showToast(`User role updated to ${newRole}`)
      fetchUsers()
      if (selectedUserDetail && selectedUserDetail.user?._id === userId) {
        fetchUserDetail(userId)
      }
    } catch (err) {
      alert(err.message)
    }
  }

  // Toggle User Profile Verification
  const handleToggleVerification = async (userId, currentVerified) => {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/users/${userId}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVerified: !currentVerified }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed to toggle verification")
      showToast(`User verification set to ${!currentVerified}`)
      fetchUsers()
      fetchStats()
      if (selectedUserDetail && selectedUserDetail.user?._id === userId) {
        fetchUserDetail(userId)
      }
    } catch (err) {
      alert(err.message)
    }
  }

  // Delete User
  const handleDeleteUser = async (userId) => {
    if (!confirm("⚠️ Are you sure you want to PERMANENTLY delete this user and their profile? This action cannot be undone.")) return
    try {
      const res = await fetch(`${API_BASE}/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed to delete user")
      showToast("User deleted successfully")
      if (selectedUserDetail) setSelectedUserDetail(null)
      fetchUsers()
      fetchStats()
    } catch (err) {
      alert(err.message)
    }
  }

  // If Not Authenticated, Render Admin Sign In Screen
  if (!token) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF8F5", padding: "1.5rem" }}>
        <div style={{ background: "#ffffff", maxWidth: "420px", width: "100%", borderRadius: "24px", padding: "2.5rem", border: "1px solid #FFE4E8", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#FFF0F2", color: "#842029", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <ShieldCheck size={28} />
            </div>
            <h1 className="font-serif" style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#640515" }}>
              MeriJodi Admin
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#6B7280", marginTop: "0.25rem" }}>
              Trust &amp; Safety Portal Access
            </p>
          </div>

          {loginError && (
            <div style={{ padding: "0.75rem 1rem", background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", borderRadius: "12px", fontSize: "0.8125rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertTriangle size={16} /> {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", color: "#4B5563", marginBottom: "0.5rem" }}>
                Admin Email
              </label>
              <input
                type="email"
                required
                placeholder="admin@merijodi.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #D1D5DB", outline: "none", fontSize: "0.875rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", color: "#4B5563", marginBottom: "0.5rem" }}>
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #D1D5DB", outline: "none", fontSize: "0.875rem" }}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="btn btn-primary"
              style={{ padding: "0.875rem", fontSize: "0.9375rem", marginTop: "0.5rem", width: "100%" }}
            >
              {loginLoading ? "Authenticating..." : "Sign In to Admin Console"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Computed counts from live stats or cached lists
  const totalUsersCount = stats?.counts?.totalUsers ?? usersList.length
  const verifiedProfilesCount = stats?.counts?.verifiedProfiles ?? usersList.filter((u) => u.isVerified).length
  const pendingVerificationsCount = stats?.counts?.pendingVerifications ?? verifications.filter((v) => v.status === "pending" || v.status === "submitted" || v.status === "under_review").length
  const pendingReportsCount = stats?.counts?.pendingReports ?? reports.filter((r) => r.status === "pending").length

  return (
    <div className="admin-container">
      {/* Sidebar Overlay on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 25 }}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--primary-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 className="font-serif" style={{ fontSize: "1.25rem", color: "var(--primary)", fontWeight: "bold" }}>
              MeriJodi
            </h2>
            <span style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", fontWeight: "bold" }}>
              Admin Console
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <nav style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <button
            onClick={() => { setCurrentTab("overview"); setSidebarOpen(false) }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              border: "none",
              background: currentTab === "overview" ? "var(--primary-light)" : "transparent",
              color: currentTab === "overview" ? "var(--primary)" : "var(--text-dark)",
              fontWeight: currentTab === "overview" ? "700" : "500",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "0.875rem",
            }}
          >
            <Activity size={18} /> Overview &amp; KPIs
          </button>

          <button
            onClick={() => { setCurrentTab("verifications"); setSidebarOpen(false) }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              border: "none",
              background: currentTab === "verifications" ? "var(--primary-light)" : "transparent",
              color: currentTab === "verifications" ? "var(--primary)" : "var(--text-dark)",
              fontWeight: currentTab === "verifications" ? "700" : "500",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "0.875rem",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <FileText size={18} /> KYC Verifications
            </span>
            {pendingVerificationsCount > 0 && (
              <span className="badge badge-pending">{pendingVerificationsCount}</span>
            )}
          </button>

          <button
            onClick={() => { setCurrentTab("reports"); setSidebarOpen(false) }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              border: "none",
              background: currentTab === "reports" ? "var(--primary-light)" : "transparent",
              color: currentTab === "reports" ? "var(--primary)" : "var(--text-dark)",
              fontWeight: currentTab === "reports" ? "700" : "500",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "0.875rem",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <AlertTriangle size={18} /> Abuse Reports
            </span>
            {pendingReportsCount > 0 && (
              <span className="badge badge-rejected">{pendingReportsCount}</span>
            )}
          </button>

          <button
            onClick={() => { setCurrentTab("users"); setSidebarOpen(false) }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              border: "none",
              background: currentTab === "users" ? "var(--primary-light)" : "transparent",
              color: currentTab === "users" ? "var(--primary)" : "var(--text-dark)",
              fontWeight: currentTab === "users" ? "700" : "500",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "0.875rem",
            }}
          >
            <Users size={18} /> User Directory
          </button>
        </nav>

        <div style={{ padding: "1.25rem", borderTop: "1px solid var(--primary-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "0.8125rem", fontWeight: "700", color: "var(--text-dark)" }}>
              {adminUser?.name || "Administrator"}
            </p>
            <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
              {adminUser?.email || "admin@merijodi.com"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: "0.5rem" }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: "inline-flex", background: "none", border: "none", cursor: "pointer", padding: "0.5rem" }}
            >
              <Menu size={22} />
            </button>
            <h1 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#1F2937" }}>
              {currentTab === "overview" && "Dashboard Overview & Platform KPIs"}
              {currentTab === "verifications" && "KYC Document Verification Requests"}
              {currentTab === "reports" && "Safety & Abuse Reports"}
              {currentTab === "users" && "User Directory & Moderation"}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={refreshAll}
              title="Refresh Data"
              className="btn btn-outline btn-sm"
              style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
            >
              <RefreshCw size={14} className={loadingData ? "animate-spin" : ""} /> Refresh
            </button>
            <span className="badge badge-approved">System Operational</span>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="admin-content">
          {toastMessage && (
            <div style={{ padding: "1rem 1.25rem", background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46", borderRadius: "16px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "600", fontSize: "0.875rem" }}>
              <CheckCircle size={18} /> {toastMessage}
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {currentTab === "overview" && (
            <div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: "#EFF6FF", color: "#2563EB" }}>
                    <Users size={26} />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Total Registered</span>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#1F2937" }}>{totalUsersCount}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: "var(--success-bg)", color: "#10B981" }}>
                    <UserCheck size={26} />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Verified Profiles</span>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#1F2937" }}>{verifiedProfilesCount}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: "var(--warning-bg)", color: "#F59E0B" }}>
                    <FileText size={26} />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Pending Verifications</span>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#1F2937" }}>{pendingVerificationsCount}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: "var(--danger-bg)", color: "#EF4444" }}>
                    <AlertTriangle size={26} />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Active Reports</span>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#1F2937" }}>{pendingReportsCount}</h3>
                  </div>
                </div>
              </div>

              {/* Engagement Stats row */}
              {stats?.counts && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                  <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--primary-border)", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#FFF0F2", color: "#842029", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Heart size={20} />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Match Interests</p>
                      <h4 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{stats.counts.totalInterests || 0}</h4>
                    </div>
                  </div>

                  <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--primary-border)", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#ECFDF5", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Accepted Matches</p>
                      <h4 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{stats.counts.acceptedInterests || 0}</h4>
                    </div>
                  </div>

                  <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--primary-border)", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#F5F3FF", color: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Direct Chat Messages</p>
                      <h4 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{stats.counts.totalMessages || 0}</h4>
                    </div>
                  </div>

                  <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--primary-border)", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#FEF2F2", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <UserX size={20} />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Banned Accounts</p>
                      <h4 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{stats.counts.bannedUsers || 0}</h4>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Queues Preview */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
                <div className="data-table-container">
                  <div className="table-header-bar">
                    <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--primary)" }}>
                      Pending Verifications ({pendingVerificationsCount})
                    </h3>
                    <button onClick={() => setCurrentTab("verifications")} className="btn btn-outline btn-sm">
                      View All
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table>
                      <thead>
                        <tr>
                          <th>Applicant</th>
                          <th>Document</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verifications.slice(0, 5).map((v) => (
                          <tr key={v._id}>
                            <td style={{ fontWeight: "600" }}>{v.profileId?.name || "Member"}</td>
                            <td style={{ textTransform: "uppercase" }}>{v.documentType || "ID Proof"}</td>
                            <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                            <td>
                              <button onClick={() => { setSelectedVerification(v); setActionNote(v.reviewNote || "") }} className="btn btn-primary btn-sm">
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                        {verifications.length === 0 && (
                          <tr><td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No verification requests pending.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="data-table-container">
                  <div className="table-header-bar">
                    <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--primary)" }}>
                      Safety Reports ({pendingReportsCount})
                    </h3>
                    <button onClick={() => setCurrentTab("reports")} className="btn btn-outline btn-sm">
                      View All
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table>
                      <thead>
                        <tr>
                          <th>Reported Member</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.slice(0, 5).map((r) => (
                          <tr key={r._id}>
                            <td style={{ fontWeight: "600" }}>{r.reportedProfileId?.name || "Member"}</td>
                            <td>{r.reason}</td>
                            <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                            <td>
                              <button onClick={() => { setSelectedReport(r); setActionNote(r.actionTaken || "") }} className="btn btn-outline btn-sm">
                                Inspect
                              </button>
                            </td>
                          </tr>
                        ))}
                        {reports.length === 0 && (
                          <tr><td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No abuse reports filed.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VERIFICATIONS */}
          {currentTab === "verifications" && (
            <div className="data-table-container">
              <div className="table-header-bar">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Filter size={16} color="var(--text-muted)" />
                  <select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    style={{ padding: "0.5rem 1rem", borderRadius: "9999px", border: "1px solid var(--border-color)", fontSize: "0.8125rem", outline: "none" }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                  Showing {verifications.filter((v) => verificationFilter === "all" || v.status === verificationFilter).length} submissions
                </span>
              </div>

              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Profile Name</th>
                      <th>Document Type</th>
                      <th>Submitted Date</th>
                      <th>Status</th>
                      <th>Review Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications
                      .filter((v) => verificationFilter === "all" || v.status === verificationFilter)
                      .map((v) => (
                        <tr key={v._id}>
                          <td style={{ fontWeight: "700" }}>{v.profileId?.name || "MeriJodi Member"}</td>
                          <td style={{ textTransform: "uppercase", fontWeight: "600", fontSize: "0.8125rem" }}>{v.documentType || "Govt ID"}</td>
                          <td>{new Date(v.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</td>
                          <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                          <td style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{v.reviewNote || "—"}</td>
                          <td>
                            <button
                              onClick={() => { setSelectedVerification(v); setActionNote(v.reviewNote || "") }}
                              className="btn btn-primary btn-sm"
                              style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                            >
                              <Eye size={14} /> Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    {verifications.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>No verification submissions found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: REPORTS */}
          {currentTab === "reports" && (
            <div className="data-table-container">
              <div className="table-header-bar">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Filter size={16} color="var(--text-muted)" />
                  <select
                    value={reportFilter}
                    onChange={(e) => setReportFilter(e.target.value)}
                    style={{ padding: "0.5rem 1rem", borderRadius: "9999px", border: "1px solid var(--border-color)", fontSize: "0.8125rem", outline: "none" }}
                  >
                    <option value="all">All Reports</option>
                    <option value="pending">Pending Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Reported User</th>
                      <th>Reporter</th>
                      <th>Violation Reason</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports
                      .filter((r) => reportFilter === "all" || r.status === reportFilter)
                      .map((r) => (
                        <tr key={r._id}>
                          <td style={{ fontWeight: "700" }}>{r.reportedProfileId?.name || "Reported Member"}</td>
                          <td>{r.reporterProfileId?.name || "Anonymous Member"}</td>
                          <td><span className="badge badge-rejected">{r.reason}</span></td>
                          <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.description || "No comment provided"}
                          </td>
                          <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                          <td>
                            <button
                              onClick={() => { setSelectedReport(r); setActionNote(r.actionTaken || "") }}
                              className="btn btn-outline btn-sm"
                            >
                              Inspect Report
                            </button>
                          </td>
                        </tr>
                      ))}
                    {reports.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>No reports in this category.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: USERS DIRECTORY & MODERATION */}
          {currentTab === "users" && (
            <div className="data-table-container">
              <div className="table-header-bar" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#F3F4F6", padding: "0.5rem 1rem", borderRadius: "9999px", minWidth: "260px" }}>
                  <Search size={16} color="#9CA3AF" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "0.8125rem" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "0.8125rem", outline: "none" }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="banned">Banned</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "0.8125rem", outline: "none" }}
                  >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>User / Profile</th>
                      <th>Email / Contact</th>
                      <th>Role &amp; Status</th>
                      <th>Verification</th>
                      <th>Completeness</th>
                      <th>Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList
                      .filter((u) => {
                        if (!searchQuery) return true
                        const q = searchQuery.toLowerCase()
                        return (
                          u.name?.toLowerCase().includes(q) ||
                          u.email?.toLowerCase().includes(q) ||
                          u.phone?.toLowerCase().includes(q) ||
                          u.location?.city?.toLowerCase().includes(q)
                        )
                      })
                      .map((u) => (
                        <tr key={u._id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#FFE4E8", color: "#842029", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.875rem" }}>
                                {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div>
                                <p style={{ fontWeight: "700", color: "var(--text-dark)" }}>{u.name || "Member"}</p>
                                <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                                  {u.gender ? u.gender.charAt(0).toUpperCase() + u.gender.slice(1) : ""} &bull; {u.location?.city || "India"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <p style={{ fontSize: "0.8125rem" }}>{u.email}</p>
                            <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{u.phone || "No phone"}</p>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                              <span className={`badge ${u.role === "admin" ? "badge-approved" : "badge-pending"}`}>
                                {u.role}
                              </span>
                              <span className={`badge ${u.status === "active" ? "badge-approved" : u.status === "banned" ? "badge-rejected" : "badge-pending"}`}>
                                {u.status}
                              </span>
                            </div>
                          </td>
                          <td>
                            {u.isVerified ? (
                              <span className="badge badge-approved" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                                <CheckCircle size={12} /> Verified
                              </span>
                            ) : (
                              <span className="badge badge-pending">Unverified</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <div style={{ width: "50px", height: "5px", background: "#E5E7EB", borderRadius: "9999px", overflow: "hidden" }}>
                                <div style={{ width: `${u.profileCompletionPct || 0}%`, height: "100%", background: "var(--primary)" }} />
                              </div>
                              <span style={{ fontSize: "0.75rem", fontWeight: "700" }}>{u.profileCompletionPct || 0}%</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                              {/* Inspect details button */}
                              <button
                                onClick={() => fetchUserDetail(u._id)}
                                title="View Complete Dossier"
                                className="btn btn-outline btn-sm"
                                style={{ padding: "0.35rem 0.5rem" }}
                              >
                                <Eye size={13} /> Details
                              </button>

                              {/* Toggle Verify */}
                              <button
                                onClick={() => handleToggleVerification(u._id, u.isVerified)}
                                title={u.isVerified ? "Revoke Verification" : "Verify Profile"}
                                className={`btn btn-sm ${u.isVerified ? "btn-outline" : "btn-primary"}`}
                                style={{ padding: "0.35rem 0.5rem" }}
                              >
                                {u.isVerified ? <UserX size={13} /> : <UserCheck size={13} />}
                              </button>

                              {/* Ban / Activate */}
                              {u.status === "banned" ? (
                                <button
                                  onClick={() => handleUpdateUserStatus(u._id, "active")}
                                  title="Unban User"
                                  className="btn btn-success btn-sm"
                                  style={{ padding: "0.35rem 0.5rem" }}
                                >
                                  <CheckCircle size={13} /> Unban
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateUserStatus(u._id, "banned")}
                                  title="Ban User"
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: "0.35rem 0.5rem" }}
                                >
                                  <UserX size={13} /> Ban
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                title="Delete Account"
                                className="btn btn-outline btn-sm"
                                style={{ padding: "0.35rem 0.5rem", color: "var(--danger)", borderColor: "#FECACA" }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {usersList.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>No users found matching filter.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: VERIFICATION REVIEW */}
      {selectedVerification && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "24px", maxWidth: "560px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", color: "var(--primary)" }}>
                Review KYC Document Submission
              </h3>
              <button onClick={() => setSelectedVerification(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Applicant Name</p>
                <p style={{ fontWeight: "bold", fontSize: "1rem" }}>{selectedVerification.profileId?.name || "Member"}</p>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                  Submitted Document ({selectedVerification.documentType || "ID Proof"})
                </p>
                <div style={{ border: "1px solid var(--border-color)", borderRadius: "12px", overflow: "hidden", maxHeight: "260px", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9FAFB" }}>
                  {selectedVerification.documentUrl ? (
                    <img src={selectedVerification.documentUrl} alt="KYC Document" style={{ width: "100%", height: "auto", objectFit: "contain", maxHeight: "260px" }} />
                  ) : (
                    <p style={{ padding: "2rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>No document preview available</p>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                  Admin Review Note (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Government Aadhaar Verified Successfully"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--border-color)", fontSize: "0.875rem", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => handleReviewVerification("rejected")}
                  disabled={actionLoading}
                  className="btn btn-danger"
                  style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <XCircle size={16} /> Reject Document
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewVerification("verified")}
                  disabled={actionLoading}
                  className="btn btn-success"
                  style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <CheckCircle size={16} /> Approve &amp; Verify Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REPORT RESOLUTION */}
      {selectedReport && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "24px", maxWidth: "560px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", color: "var(--danger)" }}>
                Inspect Safety &amp; Abuse Report
              </h3>
              <button onClick={() => setSelectedReport(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ padding: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Reported User</p>
                  <p style={{ fontWeight: "bold" }}>{selectedReport.reportedProfileId?.name || "Reported Member"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Violation Reason</p>
                  <span className="badge badge-rejected">{selectedReport.reason}</span>
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#FEF2F2", borderRadius: "12px", border: "1px solid #FECACA" }}>
                <p style={{ fontSize: "0.8125rem", color: "#991B1B", fontWeight: "600", marginBottom: "0.25rem" }}>Reporter Description:</p>
                <p style={{ fontSize: "0.875rem", color: "#7F1D1D" }}>{selectedReport.description || "No additional comments provided."}</p>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                  Resolution / Action Taken Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Warning issued to user, content removed"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--border-color)", fontSize: "0.875rem", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => handleUpdateReport("dismissed")}
                  disabled={actionLoading}
                  className="btn btn-outline"
                >
                  Dismiss Report
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateReport("resolved")}
                  disabled={actionLoading}
                  className="btn btn-primary"
                >
                  Mark as Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: USER FULL DOSSIER DETAIL */}
      {selectedUserDetail && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "24px", maxWidth: "700px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#FFF0F2", color: "#842029", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                  {selectedUserDetail.user?.name ? selectedUserDetail.user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", color: "var(--primary)" }}>
                    {selectedUserDetail.user?.name || "Member Profile"}
                  </h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {selectedUserDetail.user?.email} &bull; {selectedUserDetail.user?.phone || "No phone"}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedUserDetail(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Account Badges */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <span className={`badge ${selectedUserDetail.user?.role === "admin" ? "badge-approved" : "badge-pending"}`}>
                  Role: {selectedUserDetail.user?.role}
                </span>
                <span className={`badge ${selectedUserDetail.user?.status === "active" ? "badge-approved" : "badge-rejected"}`}>
                  Status: {selectedUserDetail.user?.status}
                </span>
                <span className={`badge ${selectedUserDetail.profile?.isVerified ? "badge-approved" : "badge-pending"}`}>
                  {selectedUserDetail.profile?.isVerified ? "KYC Verified" : "Unverified"}
                </span>
                <span className="badge badge-pending">
                  Completeness: {selectedUserDetail.profile?.profileCompletionPct || 0}%
                </span>
              </div>

              {/* Personal & Horoscope Info */}
              <div style={{ background: "#F9FAFB", padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#842029", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.75rem" }}>
                  Personal &amp; Horoscope Details
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", fontSize: "0.8125rem" }}>
                  <div><span style={{ color: "var(--text-muted)" }}>Gender:</span> <p style={{ fontWeight: "700", textTransform: "capitalize" }}>{selectedUserDetail.profile?.gender || "—"}</p></div>
                  <div><span style={{ color: "var(--text-muted)" }}>Date of Birth:</span> <p style={{ fontWeight: "700" }}>{selectedUserDetail.profile?.dateOfBirth ? new Date(selectedUserDetail.profile.dateOfBirth).toLocaleDateString("en-IN") : "—"}</p></div>
                  <div><span style={{ color: "var(--text-muted)" }}>Birth Place:</span> <p style={{ fontWeight: "700" }}>{selectedUserDetail.profile?.placeOfBirth || "—"}</p></div>
                  <div><span style={{ color: "var(--text-muted)" }}>Birth Time:</span> <p style={{ fontWeight: "700", color: "#842029" }}>{selectedUserDetail.profile?.timeOfBirth || "—"}</p></div>
                  <div><span style={{ color: "var(--text-muted)" }}>Religion:</span> <p style={{ fontWeight: "700" }}>{selectedUserDetail.profile?.religion || "—"}</p></div>
                  <div><span style={{ color: "var(--text-muted)" }}>Caste:</span> <p style={{ fontWeight: "700" }}>{selectedUserDetail.profile?.caste || "—"}</p></div>
                  <div><span style={{ color: "var(--text-muted)" }}>Gotra:</span> <p style={{ fontWeight: "700" }}>{selectedUserDetail.profile?.gotham || "—"}</p></div>
                  <div><span style={{ color: "var(--text-muted)" }}>Rashi / Nakshatra:</span> <p style={{ fontWeight: "700" }}>{selectedUserDetail.profile?.rashi || "—"} / {selectedUserDetail.profile?.nakshtra || "—"}</p></div>
                  <div><span style={{ color: "var(--text-muted)" }}>Manglik:</span> <p style={{ fontWeight: "700", textTransform: "capitalize" }}>{selectedUserDetail.profile?.manglik || "—"}</p></div>
                  <div><span style={{ color: "var(--text-muted)" }}>Marital Status:</span> <p style={{ fontWeight: "700", textTransform: "capitalize" }}>{selectedUserDetail.profile?.maritalStatus?.replace(/_/g, " ") || "—"}</p></div>
                </div>
              </div>

              {/* Career & Location */}
              <div style={{ background: "#F9FAFB", padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#842029", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.75rem" }}>
                  Career &amp; Location
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", fontSize: "0.8125rem" }}>
                  <div><span style={{ color: "var(--text-muted)" }}>Highest Degree:</span> <p style={{ fontWeight: "700" }}>{selectedUserDetail.profile?.education?.highestDegree || "—"}</p></div>
                  <div><span style={{ color: "var(--text-muted)" }}>Occupation:</span> <p style={{ fontWeight: "700" }}>{selectedUserDetail.profile?.career?.occupation || "—"}</p></div>
                  <div><span style={{ color: "var(--text-muted)" }}>Company:</span> <p style={{ fontWeight: "700" }}>{selectedUserDetail.profile?.career?.companyName || "—"}</p></div>
                  <div><span style={{ color: "var(--text-muted)" }}>Annual Income:</span> <p style={{ fontWeight: "700" }}>{selectedUserDetail.profile?.career?.annualIncome || "—"}</p></div>
                  <div><span style={{ color: "var(--text-muted)" }}>Location:</span> <p style={{ fontWeight: "700" }}>{selectedUserDetail.profile?.location?.city || "—"}, {selectedUserDetail.profile?.location?.state || ""}</p></div>
                  <div><span style={{ color: "var(--text-muted)" }}>Mother Tongue:</span> <p style={{ fontWeight: "700" }}>{selectedUserDetail.profile?.motherTongue || "—"}</p></div>
                </div>
              </div>

              {/* Moderation Controls within Dossier */}
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "flex-end", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)" }}>
                {selectedUserDetail.user?.status === "banned" ? (
                  <button
                    onClick={() => handleUpdateUserStatus(selectedUserDetail.user._id, "active")}
                    className="btn btn-success btn-sm"
                  >
                    <CheckCircle size={14} /> Unban User
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateUserStatus(selectedUserDetail.user._id, "banned")}
                    className="btn btn-danger btn-sm"
                  >
                    <UserX size={14} /> Ban User Account
                  </button>
                )}

                <button
                  onClick={() => handleToggleVerification(selectedUserDetail.user._id, selectedUserDetail.profile?.isVerified)}
                  className="btn btn-primary btn-sm"
                >
                  <ShieldCheck size={14} /> {selectedUserDetail.profile?.isVerified ? "Revoke Verification" : "Approve Verification"}
                </button>

                <button
                  onClick={() => handleUpdateUserRole(selectedUserDetail.user._id, selectedUserDetail.user?.role === "admin" ? "user" : "admin")}
                  className="btn btn-outline btn-sm"
                >
                  <Shield size={14} /> {selectedUserDetail.user?.role === "admin" ? "Demote to User" : "Promote to Admin"}
                </button>

                <button
                  onClick={() => handleDeleteUser(selectedUserDetail.user._id)}
                  className="btn btn-outline btn-sm"
                  style={{ color: "var(--danger)", borderColor: "#FECACA" }}
                >
                  <Trash2 size={14} /> Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}