import { Heart } from "lucide-react";

export default function ConfirmInterestModal({
  isOpen,
  onClose,
  onConfirm,
  profileName = "This profile",
  profileImage = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
}){
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#FFE4E8]">
        <div className="flex justify-center mt-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#842029] shadow-md">
            <Heart className="h-9 w-9 fill-white text-white" strokeWidth={2} />
          </div>
        </div>

        <div className="mt-6 border-t border-rose-100" />

        <div className="mt-6 flex items-center justify-center gap-3">
          <img src={profileImage} alt="profile" className="h-12 w-12 rounded-full object-cover border border-rose-200" />
          <div className="text-left">
            <h3 className="text-base font-bold text-gray-800 font-serif">{profileName}</h3>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Ready to connect</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#640515]">
            Confirm Interest Request
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-gray-600">
            You're about to express interest in <strong>{profileName}</strong>.
            If they accept your request, you'll be notified immediately and can start a direct conversation.
          </p>
        </div>

        <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 rounded-full border border-gray-200 bg-white text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:flex-1 py-3 rounded-full bg-[#842029] text-white text-xs sm:text-sm font-semibold hover:bg-[#6b1b27] transition-all shadow-md"
          >
            Confirm &amp; Send Request
          </button>
        </div>
      </div>
    </div>
  );
}
