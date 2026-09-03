import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { Menu, X, Heart, MessageSquare, Star, User, LogOut, Compass } from "lucide-react"
import logo2 from "../assets/logo2.png"
import { useAuth } from "../context/AuthContext"
import NotificationDropdown from "./NotificationDropdown"

export default function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const { isAuth, user, signOut } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        try {
            await signOut()
            navigate("/login")
        } catch {
            navigate("/login")
        }
    }

    const isActive = (path) => location.pathname === path

    return (
        <nav className="w-full border-b bg-[#FFF4F6] sticky top-0 z-40 shadow-xs border-[#FFE4E8]">
            <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link to={isAuth ? "/home" : "/"} className="flex items-center gap-2">
                    <img src={logo2} alt="MeriJodi Logo" className="h-9 sm:h-10 w-auto" />
                </Link>

                {/* Desktop Nav Links */}
                {isAuth ? (
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            to="/home"
                            className={`text-sm font-semibold transition-colors ${
                                isActive("/home") ? "text-[#842029] border-b-2 border-[#842029] pb-1" : "text-gray-700 hover:text-[#842029]"
                            }`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/browse-matches"
                            className={`text-sm font-semibold transition-colors ${
                                isActive("/browse-matches") ? "text-[#842029] border-b-2 border-[#842029] pb-1" : "text-gray-700 hover:text-[#842029]"
                            }`}
                        >
                            Browse Matches
                        </Link>
                        <Link
                            to="/shortlist"
                            className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                                isActive("/shortlist") ? "text-[#842029] border-b-2 border-[#842029] pb-1" : "text-gray-700 hover:text-[#842029]"
                            }`}
                        >
                            <Star size={15} /> Shortlist
                        </Link>
                        <Link
                            to="/interests-received"
                            className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                                isActive("/interests-received") || isActive("/sent-interests") ? "text-[#842029] border-b-2 border-[#842029] pb-1" : "text-gray-700 hover:text-[#842029]"
                            }`}
                        >
                            <Heart size={15} /> Interests
                        </Link>
                        <Link
                            to="/chat"
                            className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                                isActive("/chat") ? "text-[#842029] border-b-2 border-[#842029] pb-1" : "text-gray-700 hover:text-[#842029]"
                            }`}
                        >
                            <MessageSquare size={15} /> Messages
                        </Link>
                    </div>
                ) : (
                    <div className="hidden md:flex items-center gap-8">
                        <a href="/#home" className="text-sm font-semibold text-gray-700 hover:text-[#842029] transition-colors">
                            Home
                        </a>
                        <a href="/#about" className="text-sm font-semibold text-gray-700 hover:text-[#842029] transition-colors">
                            About
                        </a>
                        <Link to="/browse-matches" className="text-sm font-semibold text-gray-700 hover:text-[#842029] transition-colors">
                            Browse Matches
                        </Link>
                    </div>
                )}

                {/* Right Side Actions */}
                <div className="flex items-center gap-3">
                    {isAuth ? (
                        <>
                            <NotificationDropdown />
                            {user?.role === "admin" && (
                                <Link
                                    to="/admin"
                                    title="Admin Console"
                                    className="px-3 py-1.5 rounded-full bg-rose-100 text-[#842029] text-xs font-bold hover:bg-rose-200 transition-colors hidden sm:flex items-center gap-1"
                                >
                                    Admin
                                </Link>
                            )}
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white border border-[#FFE4E8] text-xs sm:text-sm font-semibold text-gray-800 hover:border-[#842029] transition-all shadow-xs"
                            >
                                <User size={14} className="text-[#842029]" />
                                <span className="max-w-[100px] truncate">{user?.name?.split(" ")[0] || "Profile"}</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                title="Sign Out"
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-full transition-colors hidden sm:flex"
                            >
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate("/login")}
                                className="rounded-full bg-white px-6 py-2 text-[#842029] font-semibold text-xs sm:text-sm border border-[#FFE4E8] hover:bg-[#842029] hover:text-white transition-all shadow-xs"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate("/register")}
                                className="hidden sm:block rounded-full bg-[#842029] px-6 py-2 text-white font-semibold text-xs sm:text-sm hover:bg-[#6b1b27] transition-all shadow-xs"
                            >
                                Sign Up Free
                            </button>
                        </div>
                    )}

                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-700 hover:text-[#842029] rounded-lg"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-200 px-6 py-5 space-y-4 animate-in slide-in-from-top-2">
                    {isAuth ? (
                        <>
                            <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{user?.name || "Member"}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                                <Link
                                    to="/profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-xs font-semibold text-[#842029] underline"
                                >
                                    My Profile
                                </Link>
                            </div>
                            <div className="space-y-3 text-sm font-semibold text-gray-700">
                                <Link
                                    to="/home"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-1.5 hover:text-[#842029]"
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/browse-matches"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-1.5 hover:text-[#842029]"
                                >
                                    Browse Matches
                                </Link>
                                <Link
                                    to="/shortlist"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2 py-1.5 hover:text-[#842029]"
                                >
                                    <Star size={16} /> Shortlisted Matches
                                </Link>
                                <Link
                                    to="/interests-received"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2 py-1.5 hover:text-[#842029]"
                                >
                                    <Heart size={16} /> Interests Received
                                </Link>
                                <Link
                                    to="/sent-interests"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2 py-1.5 hover:text-[#842029]"
                                >
                                    <Heart size={16} /> Sent Interests
                                </Link>
                                <Link
                                    to="/chat"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2 py-1.5 hover:text-[#842029]"
                                >
                                    <MessageSquare size={16} /> Messages
                                </Link>
                            </div>
                            <div className="pt-3 border-t border-gray-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left text-sm font-semibold text-red-600 flex items-center gap-2 py-2"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3 text-sm font-semibold text-gray-700">
                            <a href="/#home" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-[#842029]">
                                Home
                            </a>
                            <a href="/#about" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-[#842029]">
                                About
                            </a>
                            <Link to="/browse-matches" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-[#842029]">
                                Browse Matches
                            </Link>
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-gray-700">
                                Login
                            </Link>
                            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-[#842029]">
                                Create Free Account
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    )
}