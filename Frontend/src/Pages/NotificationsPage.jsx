import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Check, Trash2, Heart, MessageCircle, Star, Info } from "lucide-react"
import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import { getNotifications, markAsRead, markAllAsRead } from "../api/notificationApi"
import { useToast } from "../context/ToastContext"

export default function NotificationsPage() {
    const navigate = useNavigate()
    const addToast = useToast()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)

    useEffect(() => {
        fetchNotifications(1)
    }, [])

    const fetchNotifications = async (pageNum) => {
        try {
            setLoading(true)
            const res = await getNotifications(pageNum)
            if (pageNum === 1) {
                setNotifications(res.notifications)
            } else {
                setNotifications((prev) => [...prev, ...res.notifications])
            }
            setHasMore(res.pagination.page < res.pagination.totalPages)
            setPage(pageNum)
        } catch (err) {
            addToast("Failed to load notifications", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id)
            setNotifications(notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
        } catch (err) {
            addToast("Failed to mark as read", "error")
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead()
            setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
            addToast("All notifications marked as read", "success")
        } catch (err) {
            addToast("Failed to mark all as read", "error")
        }
    }

    const getIcon = (type) => {
        switch (type) {
            case "new_interest":
                return <Heart size={20} className="text-pink-500" />
            case "interest_accepted":
                return <Check size={20} className="text-green-500" />
            case "new_message":
                return <MessageCircle size={20} className="text-blue-500" />
            case "shortlisted":
                return <Star size={20} className="text-amber-500" />
            default:
                return <Info size={20} className="text-gray-500" />
        }
    }

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification._id)
        }
        
        // Navigate based on type
        if (notification.type === "new_message") {
            navigate("/chat")
        } else if (notification.type === "new_interest" || notification.type === "interest_accepted") {
            navigate("/interests-received")
        } else if (notification.relatedProfileId) {
            navigate(`/match-details/${notification.relatedProfileId._id || notification.relatedProfileId}`)
        }
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 font-serif">Notifications</h1>
                                {unreadCount > 0 && (
                                    <p className="text-xs text-red-600 font-medium">You have {unreadCount} unread notifications</p>
                                )}
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                            >
                                <Check size={16} /> Mark all as read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="divide-y divide-gray-50">
                        {loading && page === 1 ? (
                            <div className="p-12 text-center text-gray-500">
                                <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-red-600 animate-spin mx-auto mb-3"></div>
                                Loading notifications...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mx-auto mb-4">
                                    <Bell size={28} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications yet</h3>
                                <p className="text-sm text-gray-500">When you receive interests or messages, they will appear here.</p>
                            </div>
                        ) : (
                            <>
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 sm:p-5 flex gap-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                                            !notification.isRead ? "bg-red-50/30" : ""
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${!notification.isRead ? "bg-white shadow-sm" : "bg-gray-50"}`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(notification.createdAt).toLocaleDateString(undefined, { 
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                                })}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 mt-2"></div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Load More */}
                        {hasMore && (
                            <div className="p-4 text-center border-t border-gray-100">
                                <button
                                    onClick={() => fetchNotifications(page + 1)}
                                    disabled={loading}
                                    className="px-5 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Loading..." : "Load More"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
