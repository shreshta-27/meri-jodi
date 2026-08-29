import { useNavigate } from "react-router-dom"
import { Heart, Compass, ArrowLeft } from "lucide-react"
import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"

export default function NotFoundPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-[#FBF9F9] flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 max-w-xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[#FFF0F2] text-[#842029] flex items-center justify-center mb-6 shadow-xs animate-bounce">
                    <Compass size={36} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#842029] mb-2">
                    404 Page Not Found
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#640515] mb-3">
                    Looking for Love in the Wrong Place?
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mb-8 leading-relaxed">
                    The page you are looking for doesn't exist or may have been moved. Let's get you back to your matches!
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                        onClick={() => navigate("/home")}
                        className="px-6 py-2.5 rounded-full bg-[#842029] text-white text-xs sm:text-sm font-semibold hover:bg-[#6b1b27] transition-all shadow-xs"
                    >
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => navigate("/browse-matches")}
                        className="px-6 py-2.5 rounded-full border border-[#842029] text-[#842029] text-xs sm:text-sm font-semibold hover:bg-[#842029] hover:text-white transition-all flex items-center gap-1.5"
                    >
                        <Heart size={14} fill="currentColor" /> Browse Matches
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    )
}
