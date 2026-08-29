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
    <div className="fixed inset-0 z-10 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-[688px] h-[538px] rounded-3xl bg-white px-[30px] py-[30px] shadow-2xl">
        <div className="flex justify-center mt-6">
          <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full bg-rose-700">
            <Heart className="h-[36.7px] w-[40px] fill-white text-white" strokeWidth={2} />
          </div>
        </div>

        <div className="mt-6 border-t border-rose-200" />

        <div className="mt-8 flex items-center justify-center gap-4">
          <img src={profileImage} alt="profile" className="h-12 w-12 rounded-full object-cover" />
          <div>
            <h3 className="text-base font-semibold text-gray-600">{profileName}</h3>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="h-2 w-2 rounded-full bg-rose-700" />
              <span className="text-sm">Profile shared successfully</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center text-center">
          <h2 className="font-serif text-3xl font-bold text-[#6f1025]">
            Confirm Interest Request
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-base leading-relaxed text-gray-600">
            You're about to send an interest request to this profile.
            If they accept, you'll be able to connect and start a conversation.
          </p>
        </div>

        <div className="mt-10 mx-auto flex flex-col justify-center gap-[12px] md:flex-row w-[528px] h-[54px]">
          <button
            onClick={onConfirm}
            className="w-[258px] flex items-center justify-center rounded-full bg-rose-700 px-5 py-5 text-base font-light text-white shadow-lg transition hover:bg-rose-800"
          >
            Confirm &amp; Send
          </button>
          <button
            onClick={onClose}
            className="w-[258px] flex items-center justify-center rounded-full border border-rose-500 bg-white px-5 py-5 text-base font-light text-rose-700 transition hover:bg-rose-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
