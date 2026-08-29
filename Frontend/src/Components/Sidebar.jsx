import {
  ChevronRight,
  Star,
  Eye,
  Sparkles,
  MapPin,
  HeartHandshake,
} from "lucide-react"; 

function MenuItem({ icon, title, subtitle }) {
  return (
    <div className="flex justify-between items-start cursor-pointer hover:bg-[#fdf7f7] p-2 rounded-lg transition">
      <div className="flex gap-3">
        <div className="text-[#7b001c]">{icon}</div>

        <div>
          <h4 className="font-semibold text-[#7b001c] text-base">
            {title}
          </h4>

          <p className="text-gray-600 text-sm leading-snug">
            {subtitle}
          </p>
        </div>
      </div>

      <ChevronRight
        size={18}
        className="text-[#7b001c] mt-1"
      />
    </div>
  );
}

export default function Sidebar() {
  return (
    <>
   

      <aside className="w-[320px] bg-white border-r border-gray-200 min-h-screen">
        <div className="p-6">
          <h2 className="font-serif text-[20px] text-[#7b001c] font-bold">
            All Matches
          </h2>
        </div>

        {/* Active Menu */}
        <div className="bg-[#f7eded] py-4 px-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <HeartHandshake
                size={18}
                className="text-[#7b001c]"
              />

              <span className="font-semibold text-[#7b001c] text-base">
                Your Matches
              </span>
            </div>

            <p className="mt-1 pl-8 text-gray-700 text-[12px] leading-snug">
              View all the profiles that match your preferences
            </p>
          </div>

          <ChevronRight className="text-[#7b001c]" />
        </div>

        <div className="p-6">
          <h3 className="font-serif text-[22px] font-bold text-[#7b001c]">
            Based on Activity
          </h3>

          <div className="mt-5 space-y-4">
            <MenuItem
              icon={<Star size={18} />}
              title="Shortlisted By You"
              subtitle="Matches you have shortlisted"
            />

            <div className="border-b" />

            <MenuItem
              icon={<Eye size={18} />}
              title="Viewed You"
              subtitle="Matches who have viewed your profile"
            />
          </div>

          <h3 className="font-serif text-[22px] font-bold text-[#7b001c] mt-10">
            Recently Joined & Nearby Matches
          </h3>

          <div className="mt-5 space-y-4">
            <MenuItem
              icon={<Sparkles size={18} />}
              title="Newly Joined"
              subtitle="Matches who joined within the last 30 days"
            />

            <div className="border-b" />

            <MenuItem
              icon={<MapPin size={18} />}
              title="Nearby Matches"
              subtitle="Matches near your location"
            />
          </div>
        </div>
      </aside>
    </>
  );
}