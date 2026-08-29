import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, CheckCheck, Clock, Heart, MessageSquare, ShieldCheck, X } from "lucide-react"
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadNotificationCount,
} from "../api/notificationApi"

export default function NotificationDropdown() {
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef(null)

    const fetchUnreadCount = async () => {
        try {
            const count = await getUnreadNotificationCount()
            setUnreadCount(count)
        } catch {
            /* ignore */
        }
    }

    const fetchNotificationsList = async () => {
        setLoading(true)
        try {
            const data = await getNotifications({ limit: 15 })
            setNotifications(data.notifications || [])
            fetchUnreadCount()
        } catch (err) {
            console.error("Failed to load notifications:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUnreadCount()
        const interval = setInterval(fetchUnreadCount, 30000) // Poll count every 30s
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (isOpen) {
            fetchNotificationsList()
        }
    }, [isOpen])

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleMarkAsRead = async (id, relatedProfileId, type) => {
        try {
            await markNotificationRead(id)
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            )
            setUnreadCount((c) => Math.max(0, c - 1))

            // Contextual navigation
            if (type === "new_interest" || type === "interest_received") {
                navigate("/interests-received")
            } else if (type === "interest_accepted") {
                navigate("/sent-interests")
            } else if (type === "new_message") {
                navigate("/chat")
            } else if (relatedProfileId) {
                const pId = typeof relatedProfileId === "object" ? relatedProfileId._id : relatedProfileId
                navigate(`/match-details/${pId}`)
            }
            setIsOpen(false)
        } catch (err) {
            console.error("Failed to mark as read:", err)
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead()
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
            setUnreadCount(0)
        } catch (err) {
            console.error("Failed to mark all as read:", err)
        }
    }

    const getIcon = (type) => {
        switch (type) {
            case "new_interest":
            case "interest_received":
            case "interest_accepted":
                return <Heart size={14} className="text-[#842029]" fill="currentColor" />
            case "new_message":
                return <MessageSquare size={14} className="text-blue-600" />
            case "verification":
                return <ShieldCheck size={14} className="text-emerald-600" />
            default:
                return <Clock size={14} className="text-gray-500" />
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full text-gray-700 hover:text-[#842029] hover:bg-[#FFF4F6] transition-colors"
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full bg-[#842029] text-white text-[10px] font-bold shadow-xs animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#FFE4E8] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#FFF4F6] to-white">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-[#842029] font-serif">
                                Notifications
                            </h2>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-[#842029]/10 text-[#842029] text-xs font-semibold">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-[#842029] font-medium hover:underline flex items-center gap-1"
                            >
                                <CheckCheck size={14} /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {loading ? (
                            <div className="py-8 text-center text-xs text-gray-400">
                                Loading notifications...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center text-xs text-gray-400">
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map((item) => (
                                <div
                                    key={item._id}
                                    onClick={() => handleMarkAsRead(item._id, item.relatedProfileId, item.type)}
                                    className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                                        item.isRead ? "bg-white hover:bg-gray-50" : "bg-[#FFF9FA] hover:bg-[#FFF0F2]"
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                                        {getIcon(item.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs leading-snug ${item.isRead ? "text-gray-700" : "text-gray-900 font-semibold"}`}>
                                            {item.message}
                                        </p>
                                        <span className="text-[10px] text-gray-400 mt-1 block">
                                            {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    {!item.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-[#842029] shrink-0 mt-1.5" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
